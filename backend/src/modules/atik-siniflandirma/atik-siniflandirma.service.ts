import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ClassifyAtikDto } from './dto/classify-atik.dto';
import {
  AtikTaramaKaydi,
  AtikTaramaKaydiDocument,
} from './schemas/atik-tarama-kaydi.schema';

export type AtikKategori = 'Plastik' | 'Kağıt' | 'Cam' | 'Belirsiz';

export interface AtikSiniflandirmaSonucu {
  kategori: AtikKategori;
  guven: 'Yüksek' | 'Orta' | 'Düşük';
  aciklama: string;
  // atikNoktalari koleksiyonundaki en yakin gercek 'tur' degeri - haritada/
  // listede o kategoriye filtrelemek icin kullanilabilir. Plastik/Kağıt/Cam
  // disindaki tum "Belirsiz" sonuclarda null.
  ilgiliAtikTuru: string | null;
}

// Atik/geri donusume ozel topluluk modellerinin tamami (yangy50/garbage-
// classification, TrashNet turevleri vb.) ucretsiz "hf-inference" saglayicisi
// tarafindan artik desteklenmiyor ("Model not supported by provider
// hf-inference" - denendi, dogrulandi). Bunun yerine Hugging Face'in kendi
// resmi olarak "warm" tuttugu genel ImageNet-1k siniflandiricisi kullanilip,
// 1000 sinif icinden atigimizla ilgili olanlar kendi kategorilerimize
// eslendi. huggingface.co/google/vit-base-patch16-224
const HF_MODEL = 'google/vit-base-patch16-224';
const HF_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;

// Anahtarlar, modelin config.json'undaki id2label degerleriyle BIREBIR
// eslesmeli (virgullu es anlamlilar dahil - model bunlari tek bir label
// string'i olarak donuyor). Belirsiz/alakasiz ImageNet siniflari (ör.
// "notebook, notebook computer" aslinda dizustu bilgisayar demek, kagitla
// karistirilmamali) bilincli olarak listeye eklenmedi.
const LABEL_TO_KATEGORI: Record<string, AtikKategori> = {
  'water bottle': 'Plastik',
  'pop bottle, soda bottle': 'Plastik',
  'pill bottle': 'Plastik',
  'plastic bag': 'Plastik',
  'beer bottle': 'Cam',
  'wine bottle': 'Cam',
  'beer glass': 'Cam',
  goblet: 'Cam',
  envelope: 'Kağıt',
  carton: 'Kağıt',
  'paper towel': 'Kağıt',
  'comic book': 'Kağıt',
  'book jacket, dust cover, dust jacket, dust wrapper': 'Kağıt',
  'toilet tissue, toilet paper, bathroom tissue': 'Kağıt',
};

const ATIK_TURU_MAP: Record<AtikKategori, string | null> = {
  Plastik: 'Kağıt/Karton/Plastik/Metal',
  Kağıt: 'Kağıt/Karton/Plastik/Metal',
  Cam: 'Cam',
  Belirsiz: null,
};

interface HfPrediction {
  label: string;
  score: number;
}

// Kaba tahmini ortalama ağırlıklar (kg) - "Bu hafta ~X kg tarandı" istatistiği
// için. Belirsiz sonuçlar ağırlığa dahil edilmez (ne olduğu bilinmiyor),
// sadece tarama sayısına katkı sağlar - bkz. getIstatistik().
const KATEGORI_ORTALAMA_KG: Partial<Record<AtikKategori, number>> = {
  Plastik: 0.03,
  Kağıt: 0.05,
  Cam: 0.35,
};

export interface AtikTaramaIstatistigi {
  taramaSayisi: number;
  tahminiKg: number;
}

@Injectable()
export class AtikSiniflandirmaService {
  private readonly logger = new Logger(AtikSiniflandirmaService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(AtikTaramaKaydi.name)
    private readonly taramaKaydiModel: Model<AtikTaramaKaydiDocument>,
  ) {}

  async getIstatistik(): Promise<AtikTaramaIstatistigi> {
    const yediGunOnce = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const kayitlar = await this.taramaKaydiModel
      .find({ createdAt: { $gte: yediGunOnce } })
      .select('kategori')
      .exec();

    const tahminiKg = kayitlar.reduce(
      (toplam, kayit) =>
        toplam + (KATEGORI_ORTALAMA_KG[kayit.kategori as AtikKategori] ?? 0),
      0,
    );

    return {
      taramaSayisi: kayitlar.length,
      tahminiKg: Math.round(tahminiKg * 10) / 10,
    };
  }

  async classify(dto: ClassifyAtikDto): Promise<AtikSiniflandirmaSonucu> {
    const token = this.configService.get<string>('HUGGINGFACE_API_TOKEN');
    if (!token) {
      throw new ServiceUnavailableException(
        'Atık tanıma servisi şu an yapılandırılmamış',
      );
    }

    const base64Data = dto.image.includes(',')
      ? dto.image.split(',').pop()!
      : dto.image;

    const predictions = await this.callWithColdStartRetry(token, base64Data);

    // En yuksek skorlu, kendi kategorilerimizden birine karsilik gelen ilk
    // tahmini kullan (top-1 alakasiz bir ImageNet sinifi olsa bile top-3/5
    // icinde atikla ilgili bir sinif olabilir).
    const eslesen = predictions.find(
      (p) => LABEL_TO_KATEGORI[p.label] !== undefined,
    );
    const top = eslesen ?? predictions[0];
    const kategori = eslesen ? LABEL_TO_KATEGORI[eslesen.label] : 'Belirsiz';
    const guvenYuzde = Math.round(top.score * 100);
    const guven: AtikSiniflandirmaSonucu['guven'] =
      top.score >= 0.6 ? 'Yüksek' : top.score >= 0.3 ? 'Orta' : 'Düşük';

    // İstatistik kaydı en iyi çaba (best-effort) - başarısız olursa
    // sınıflandırma sonucunu kullanıcıya döndürmeyi engellemesin.
    this.taramaKaydiModel.create({ kategori }).catch((err) => {
      this.logger.warn('Tarama kaydı oluşturulamadı', err);
    });

    return {
      kategori,
      guven,
      aciklama:
        kategori === 'Belirsiz'
          ? `Bu görsel net bir şekilde plastik, kağıt veya cam olarak sınıflandırılamadı (en yakın tahmin: "${top.label}", %${guvenYuzde}).`
          : `Bu görsel %${guvenYuzde} olasılıkla ${kategori.toLowerCase()} olarak sınıflandırıldı ("${top.label}").`,
      ilgiliAtikTuru: ATIK_TURU_MAP[kategori],
    };
  }

  private async callWithColdStartRetry(
    token: string,
    base64Image: string,
    attempt = 1,
  ): Promise<HfPrediction[]> {
    let response: Response;
    try {
      response = await fetch(HF_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: base64Image,
          parameters: { top_k: 10 },
        }),
      });
    } catch (err) {
      this.logger.error('Hugging Face isteği başarısız', err);
      throw new ServiceUnavailableException(
        'Atık tanıma servisi şu an kullanılamıyor, lütfen daha sonra tekrar deneyin',
      );
    }

    if (response.status === 503 && attempt === 1) {
      // Ucretsiz serverless model uzun sure kullanilmadiysa "cold start"
      // yasiyor - HF bu durumda 503 + tahmini yuklenme suresi donuyor, bir
      // kez kisa bir bekleme sonrasi tekrar deneniyor.
      const body = (await response.json().catch(() => null)) as {
        estimated_time?: number;
      } | null;
      const waitMs = Math.min((body?.estimated_time ?? 5) * 1000, 15_000);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      return this.callWithColdStartRetry(token, base64Image, 2);
    }

    if (!response.ok) {
      this.logger.error(
        `Hugging Face API hatasi: ${response.status} ${await response.text().catch(() => '')}`,
      );
      throw new ServiceUnavailableException(
        'Atık tanıma servisi şu an kullanılamıyor, lütfen daha sonra tekrar deneyin',
      );
    }

    return response.json() as Promise<HfPrediction[]>;
  }
}
