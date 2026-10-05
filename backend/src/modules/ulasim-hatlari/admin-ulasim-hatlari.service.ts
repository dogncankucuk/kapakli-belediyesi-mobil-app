import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { KesintiApiAyarlariService } from '../kesinti-api-ayarlari/kesinti-api-ayarlari.service';
import { CreateUlasimHattiDto } from './dto/create-ulasim-hatti.dto';
import { UpdateUlasimHattiDto } from './dto/update-ulasim-hatti.dto';
import {
  KalkisGunu,
  KalkisSaati,
  KalkisYonu,
  UlasimHatti,
  UlasimHattiDocument,
} from './schemas/ulasim-hatti.schema';

export interface AdminUlasimHatti {
  id: string;
  hatAdi: string;
  hatNumarasi: string | null;
  guzergah: string;
  canli: boolean;
  hatKodu: string | null;
  fiyatTam: string | null;
  fiyatIndirimli: string | null;
  kalkisSaatleri: KalkisSaati[];
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KesintiApiSenkronizasyonSonucu {
  basarili: number;
  hatalar: string[];
}

const GECERLI_YONLER: KalkisYonu[] = ['gidis', 'donus'];
const GECERLI_GUNLER: KalkisGunu[] = ['hergun', 'haftaici', 'haftasonu'];

function kalkisSaatleriniAyikla(deger: unknown): KalkisSaati[] {
  if (!Array.isArray(deger)) return [];
  const sonuc: KalkisSaati[] = [];
  for (const k of deger) {
    if (
      typeof k?.saat === 'string' &&
      k.saat &&
      GECERLI_YONLER.includes(k.yon)
    ) {
      sonuc.push({
        saat: k.saat,
        yon: k.yon,
        gun: GECERLI_GUNLER.includes(k.gun) ? k.gun : 'hergun',
      });
    }
  }
  return sonuc;
}

type TimestampedUlasimHatti = UlasimHattiDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminUlasimHatlariService {
  private readonly logger = new Logger(AdminUlasimHatlariService.name);

  constructor(
    @InjectModel(UlasimHatti.name)
    private readonly ulasimHattiModel: Model<UlasimHattiDocument>,
    private readonly kesintiApiAyarlariService: KesintiApiAyarlariService,
  ) {}

  async findAll(): Promise<AdminUlasimHatti[]> {
    const hatlar = await this.ulasimHattiModel
      .find()
      .sort({ hatAdi: 1 })
      .exec();
    return hatlar.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedUlasimHatti),
    );
  }

  async findOne(id: string): Promise<AdminUlasimHatti | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.ulasimHattiModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedUlasimHatti) : null;
  }

  async create(
    dto: CreateUlasimHattiDto,
    updatedBy: string,
  ): Promise<AdminUlasimHatti> {
    const created = (await this.ulasimHattiModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedUlasimHatti;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateUlasimHattiDto,
    updatedBy: string,
  ): Promise<AdminUlasimHatti | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.ulasimHattiModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedUlasimHatti) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.ulasimHattiModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  // API henuz saglanmadigi icin beklenen format kendi CreateUlasimHattiDto'muza
  // yakin tutuldu: {hatAdi, hatNumarasi?, guzergah, fiyatTam?, fiyatIndirimli?,
  // kalkisSaatleri?: [{saat, yon, gun?}]}[] JSON dizisi - "canli" ve "hatKodu"
  // CSV ile toplu eklemede de oldugu gibi kaynakta yok, varsayilan canli:false
  // ile eklenir, admin panelden sonradan isaretlenir. Gercek API geldiginde
  // format farkli cikarsa bu metod (sadece alan eslemesi) guncellenir.
  async senkronizeApiIle(
    updatedBy: string,
  ): Promise<KesintiApiSenkronizasyonSonucu> {
    const apiUrl = await this.kesintiApiAyarlariService.getApiUrl('ulasim');
    if (!apiUrl) {
      throw new BadRequestException(
        'Ulaşım hatları için API adresi henüz tanımlanmamış.',
      );
    }

    let veri: unknown;
    try {
      const yanit = await fetch(apiUrl);
      if (!yanit.ok) {
        throw new Error(`API ${yanit.status} döndü`);
      }
      veri = await yanit.json();
    } catch (err) {
      this.logger.error(
        'Ulaşım hatları API senkronizasyonu başarısız',
        err as Error,
      );
      throw new BadRequestException('API adresine ulaşılamadı');
    }

    if (!Array.isArray(veri)) {
      throw new BadRequestException('API beklenmeyen bir formatta yanıt döndü');
    }

    const hatalar: string[] = [];
    let basarili = 0;
    for (const [index, kayit] of veri.entries()) {
      const hatAdi = typeof kayit?.hatAdi === 'string' ? kayit.hatAdi.trim() : '';
      const guzergah =
        typeof kayit?.guzergah === 'string' ? kayit.guzergah.trim() : '';
      if (!hatAdi || !guzergah) {
        hatalar.push(`Kayıt ${index + 1}: eksik alan`);
        continue;
      }
      const hatNumarasi =
        typeof kayit?.hatNumarasi === 'string' ? kayit.hatNumarasi.trim() : undefined;
      const fiyatTam =
        typeof kayit?.fiyatTam === 'string' ? kayit.fiyatTam.trim() : undefined;
      const fiyatIndirimli =
        typeof kayit?.fiyatIndirimli === 'string'
          ? kayit.fiyatIndirimli.trim()
          : undefined;
      try {
        await this.create(
          {
            hatAdi,
            guzergah,
            canli: false,
            hatNumarasi,
            fiyatTam,
            fiyatIndirimli,
            kalkisSaatleri: kalkisSaatleriniAyikla(kayit?.kalkisSaatleri),
          },
          updatedBy,
        );
        basarili++;
      } catch (err) {
        hatalar.push(
          `Kayıt ${index + 1}: ${err instanceof Error ? err.message : 'oluşturulamadı'}`,
        );
      }
    }

    return { basarili, hatalar };
  }

  private toAdmin(doc: TimestampedUlasimHatti): AdminUlasimHatti {
    return {
      id: doc._id.toString(),
      hatAdi: doc.hatAdi,
      hatNumarasi: doc.hatNumarasi ?? null,
      guzergah: doc.guzergah,
      canli: doc.canli,
      hatKodu: doc.hatKodu ?? null,
      fiyatTam: doc.fiyatTam ?? null,
      fiyatIndirimli: doc.fiyatIndirimli ?? null,
      kalkisSaatleri: doc.kalkisSaatleri ?? [],
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
