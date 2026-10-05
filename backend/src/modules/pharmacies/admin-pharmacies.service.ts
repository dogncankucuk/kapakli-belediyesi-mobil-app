import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { KesintiApiAyarlariService } from '../kesinti-api-ayarlari/kesinti-api-ayarlari.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import { Pharmacy, PharmacyDocument } from './schemas/pharmacy.schema';

export interface AdminPharmacy {
  id: string;
  ad: string;
  adres: string;
  adresTarifi: string | null;
  telefon: string;
  nobetTarihi: string;
  lat: number;
  lng: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KesintiApiSenkronizasyonSonucu {
  basarili: number;
  hatalar: string[];
}

type TimestampedPharmacy = PharmacyDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminPharmaciesService {
  private readonly logger = new Logger(AdminPharmaciesService.name);

  constructor(
    @InjectModel(Pharmacy.name)
    private readonly pharmacyModel: Model<PharmacyDocument>,
    private readonly kesintiApiAyarlariService: KesintiApiAyarlariService,
  ) {}

  async findAll(): Promise<AdminPharmacy[]> {
    const pharmacies = await this.pharmacyModel
      .find()
      .sort({ nobetTarihi: -1 })
      .exec();
    return pharmacies.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedPharmacy),
    );
  }

  async findOne(id: string): Promise<AdminPharmacy | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.pharmacyModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedPharmacy) : null;
  }

  async create(
    dto: CreatePharmacyDto,
    updatedBy: string,
  ): Promise<AdminPharmacy> {
    const created = (await this.pharmacyModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedPharmacy;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdatePharmacyDto,
    updatedBy: string,
  ): Promise<AdminPharmacy | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.pharmacyModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedPharmacy) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.pharmacyModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  // API henuz saglanmadigi icin beklenen format kendi CreatePharmacyDto'muza
  // birebir ayni tutuldu: {ad, adres, adresTarifi?, telefon, nobetTarihi,
  // lat, lng}[] JSON dizisi. Gercek API geldiginde format farkli cikarsa bu
  // metod (sadece alan eslemesi) guncellenir.
  async senkronizeApiIle(
    updatedBy: string,
  ): Promise<KesintiApiSenkronizasyonSonucu> {
    const apiUrl = await this.kesintiApiAyarlariService.getApiUrl('eczane');
    if (!apiUrl) {
      throw new BadRequestException(
        'Nöbetçi eczaneler için API adresi henüz tanımlanmamış.',
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
        'Nöbetçi eczaneler API senkronizasyonu başarısız',
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
      const ad = typeof kayit?.ad === 'string' ? kayit.ad.trim() : '';
      const adres = typeof kayit?.adres === 'string' ? kayit.adres.trim() : '';
      const telefon = typeof kayit?.telefon === 'string' ? kayit.telefon.trim() : '';
      const nobetTarihi =
        typeof kayit?.nobetTarihi === 'string' ? kayit.nobetTarihi : '';
      const lat = typeof kayit?.lat === 'number' ? kayit.lat : NaN;
      const lng = typeof kayit?.lng === 'number' ? kayit.lng : NaN;
      if (!ad || !adres || !telefon || !nobetTarihi || Number.isNaN(lat) || Number.isNaN(lng)) {
        hatalar.push(`Kayıt ${index + 1}: eksik/geçersiz alan`);
        continue;
      }
      const adresTarifi =
        typeof kayit?.adresTarifi === 'string' ? kayit.adresTarifi.trim() : undefined;
      try {
        await this.create({ ad, adres, adresTarifi, telefon, nobetTarihi, lat, lng }, updatedBy);
        basarili++;
      } catch (err) {
        hatalar.push(
          `Kayıt ${index + 1}: ${err instanceof Error ? err.message : 'oluşturulamadı'}`,
        );
      }
    }

    return { basarili, hatalar };
  }

  private toAdmin(doc: TimestampedPharmacy): AdminPharmacy {
    return {
      id: doc._id.toString(),
      ad: doc.ad,
      adres: doc.adres,
      adresTarifi: doc.adresTarifi ?? null,
      telefon: doc.telefon,
      nobetTarihi: doc.nobetTarihi.toISOString(),
      lat: doc.lat,
      lng: doc.lng,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
