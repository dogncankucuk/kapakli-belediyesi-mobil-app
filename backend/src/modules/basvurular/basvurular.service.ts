import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { unlink, writeFile } from 'fs/promises';
import { Model, Types } from 'mongoose';
import { join } from 'path';

import { UPLOADS_DIR } from '../../uploads-dir';
import { CreateBasvuruDto } from './dto/create-basvuru.dto';
import {
  BasvuruTuru,
  BasvuruTuruDocument,
} from './schemas/basvuru-turu.schema';
import {
  Basvuru,
  BasvuruBelgesi,
  BasvuruDocument,
  BasvuruDurumu,
} from './schemas/basvuru.schema';

export interface PublicBasvuru {
  id: string;
  basvuruTuruAdi: string;
  durum: BasvuruDurumu;
  redSebebi: string | null;
  createdAt: string;
}

type TimestampedBasvuru = BasvuruDocument & {
  createdAt: Date;
  updatedAt: Date;
};

const IZINLI_MIME_UZANTILARI: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'application/pdf': '.pdf',
};

// Bir basvuruda birden fazla belge (kimlik, dilekce vb.) ayni istekte
// gonderilebiliyor - dosya basina limit, global 10mb govde limitiyle (bkz.
// main.ts, atikSiniflandirma ile paylasilan) birlikte birkac belge bir arada
// gonderildiginde de govdenin sinira takilmamasi icin dusuk tutuluyor
// (base64 kodlamasi boyutu ~%33 buyutuyor).
const MAKS_BELGE_BOYUTU_BYTE = 3 * 1024 * 1024;

@Injectable()
export class BasvurularService {
  constructor(
    @InjectModel(Basvuru.name)
    private readonly basvuruModel: Model<BasvuruDocument>,
    @InjectModel(BasvuruTuru.name)
    private readonly basvuruTuruModel: Model<BasvuruTuruDocument>,
  ) {}

  private async belgeleriKaydet(
    belgeler: CreateBasvuruDto['belgeler'],
  ): Promise<BasvuruBelgesi[]> {
    const kaydedilenler: BasvuruBelgesi[] = [];
    const yazilanYollar: string[] = [];
    try {
      for (const belge of belgeler ?? []) {
        const uzanti = IZINLI_MIME_UZANTILARI[belge.mimeType];
        if (!uzanti) {
          throw new BadRequestException(
            `"${belge.etiket}" belgesi icin desteklenmeyen dosya turu: ${belge.mimeType}`,
          );
        }
        const buffer = Buffer.from(belge.base64, 'base64');
        if (buffer.length > MAKS_BELGE_BOYUTU_BYTE) {
          throw new BadRequestException(
            `"${belge.etiket}" belgesi izin verilen ${
              MAKS_BELGE_BOYUTU_BYTE / (1024 * 1024)
            }MB boyut sinirini asiyor`,
          );
        }
        const dosyaAdi = `${randomUUID()}${uzanti}`;
        const dosyaYolu = join(UPLOADS_DIR, dosyaAdi);
        await writeFile(dosyaYolu, buffer);
        yazilanYollar.push(dosyaYolu);
        kaydedilenler.push({
          etiket: belge.etiket,
          url: `/uploads/${dosyaAdi}`,
          mimeType: belge.mimeType,
        });
      }
      return kaydedilenler;
    } catch (err) {
      await Promise.all(
        yazilanYollar.map((yol) => unlink(yol).catch(() => {})),
      );
      throw err;
    }
  }

  async create(dto: CreateBasvuruDto): Promise<PublicBasvuru> {
    if (!Types.ObjectId.isValid(dto.basvuruTuruId)) {
      throw new BadRequestException('Gecersiz basvuru turu');
    }
    const basvuruTuru = await this.basvuruTuruModel
      .findById(dto.basvuruTuruId)
      .exec();
    if (!basvuruTuru || !basvuruTuru.aktif) {
      throw new BadRequestException('Gecersiz basvuru turu');
    }

    const ekBilgiler = dto.ekBilgiler ?? [];
    for (const alan of basvuruTuru.ekBilgiAlanlari) {
      if (!alan.zorunlu) continue;
      const deger = ekBilgiler.find((e) => e.etiket === alan.etiket)?.deger;
      if (!deger || !deger.trim()) {
        throw new BadRequestException(`"${alan.etiket}" alani zorunludur`);
      }
    }

    const gelenBelgeler = dto.belgeler ?? [];
    for (const gerekli of basvuruTuru.gerekliBelgeler) {
      if (!gerekli.zorunlu) continue;
      const belgeVarMi = gelenBelgeler.some((b) => b.etiket === gerekli.etiket);
      if (!belgeVarMi) {
        throw new BadRequestException(`"${gerekli.etiket}" belgesi zorunludur`);
      }
    }

    const belgeler = await this.belgeleriKaydet(dto.belgeler);

    let created: TimestampedBasvuru;
    try {
      created = (await this.basvuruModel.create({
        basvuruTuruId: dto.basvuruTuruId,
        basvuruTuruAdi: basvuruTuru.baslik,
        adSoyad: dto.adSoyad,
        kimlikNo: dto.kimlikNo,
        dogumTarihi: dto.dogumTarihi,
        adres: dto.adres,
        ekBilgiler,
        belgeler,
        durum: 'beklemede',
      })) as unknown as TimestampedBasvuru;
    } catch (err) {
      await Promise.all(
        belgeler.map((belge) =>
          unlink(join(UPLOADS_DIR, belge.url.replace('/uploads/', ''))).catch(
            () => {},
          ),
        ),
      );
      throw err;
    }

    return this.toPublic(created);
  }

  // ObjectId pratikte tahmin edilebilir oldugu icin (timestamp + sabit
  // rastgele parca + artan sayac) bu auth'suz sorguya guvenmiyoruz - onun
  // yerine PublicBasvuru kisitli tutuluyor (bkz. toPublic), boylece id ele
  // gecse bile kimlikNo/dogumTarihi/adres/belgeler gibi hassas veriler
  // sizmiyor. Liste/arama endpoint'i YOK.
  async findOne(id: string): Promise<PublicBasvuru> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException();
    }

    const doc = await this.basvuruModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException();
    }

    return this.toPublic(doc as unknown as TimestampedBasvuru);
  }

  private toPublic(doc: TimestampedBasvuru): PublicBasvuru {
    return {
      id: doc._id.toString(),
      basvuruTuruAdi: doc.basvuruTuruAdi,
      durum: doc.durum,
      redSebebi: doc.redSebebi ?? null,
      createdAt: doc.createdAt.toISOString(),
    };
  }
}
