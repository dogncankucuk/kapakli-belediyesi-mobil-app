import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CbsKaynakService, CbsSenkronizeSonucu } from '../cbs/cbs-kaynak.service';
import { Pharmacy, PharmacyDocument } from '../pharmacies/schemas/pharmacy.schema';
import { CreateSaglikKurumuDto } from './dto/create-saglik-kurumu.dto';
import { UpdateSaglikKurumuDto } from './dto/update-saglik-kurumu.dto';
import {
  SaglikKurumu,
  SaglikKurumuDocument,
} from './schemas/saglik-kurumu.schema';

// CBS katman adi -> bu koleksiyondaki "tur" degeri. Ad tek basina guvenilir
// bir anahtar olmadigi icin (ör. ayni eczane adi birden fazla noktada
// tekrar edebiliyor) CBS'in kendi poi_id'si ile eslestirme yapiliyor.
const CBS_SAGLIK_KATMANLARI: Record<string, string> = {
  'gisoft:gi_poi_hospital': 'Hastane',
  'gisoft:gi_poi_pharmacy': 'Eczane',
};

export interface AdminSaglikKurumu {
  id: string;
  ad: string;
  tur: string;
  adres: string | null;
  lat: number;
  lng: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedSaglikKurumu = SaglikKurumuDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminSaglikService {
  constructor(
    @InjectModel(SaglikKurumu.name)
    private readonly saglikKurumuModel: Model<SaglikKurumuDocument>,
    @InjectModel(Pharmacy.name)
    private readonly pharmacyModel: Model<PharmacyDocument>,
    private readonly cbsKaynakService: CbsKaynakService,
  ) {}

  // "Nöbetçi Eczaneler" (pharmacies) koleksiyonu her eczane icin nobet
  // tarihi basina bir kayit tutuyor (donusumlu nobet takvimi) - burada
  // adi ayni olan kayitlari tek bir fiziksel eczaneye indirgeyip Saglik'a
  // "Eczane" turunde aktariyoruz. Ad tek basina guvenilir anahtar (TEO
  // kazima metninde fazladan bosluklar oluyor) - once normalize ediliyor.
  async eczanelerdenIceAktar(updatedBy: string): Promise<CbsSenkronizeSonucu> {
    const eczaneler = await this.pharmacyModel.find().exec();
    const tekil = new Map<
      string,
      { ad: string; adres: string; lat: number; lng: number }
    >();
    for (const eczane of eczaneler) {
      const normalizeAd = eczane.ad.replace(/\s+/g, ' ').trim();
      if (!tekil.has(normalizeAd)) {
        tekil.set(normalizeAd, {
          ad: normalizeAd,
          adres: eczane.adres,
          lat: eczane.lat,
          lng: eczane.lng,
        });
      }
    }

    let eklenen = 0;
    let guncellenen = 0;
    for (const eczane of tekil.values()) {
      const mevcut = await this.saglikKurumuModel
        .exists({ ad: eczane.ad, tur: 'Eczane' })
        .exec();
      await this.saglikKurumuModel
        .findOneAndUpdate(
          { ad: eczane.ad, tur: 'Eczane' },
          {
            ad: eczane.ad,
            tur: 'Eczane',
            adres: eczane.adres,
            lat: eczane.lat,
            lng: eczane.lng,
            updatedBy,
          },
          { upsert: true },
        )
        .exec();
      if (mevcut) guncellenen++;
      else eklenen++;
    }
    return { bulunan: tekil.size, eklenen, guncellenen };
  }

  async cbsSenkronize(updatedBy: string): Promise<CbsSenkronizeSonucu> {
    let bulunan = 0;
    let eklenen = 0;
    let guncellenen = 0;
    for (const [typeName, tur] of Object.entries(CBS_SAGLIK_KATMANLARI)) {
      const poiler = await this.cbsKaynakService.getPois(typeName);
      bulunan += poiler.length;
      for (const poi of poiler) {
        if (!poi.poiId) continue;
        const adres = await this.cbsKaynakService.getAdres(poi.districtId);
        const mevcut = await this.saglikKurumuModel
          .exists({ cbsPoiId: poi.poiId })
          .exec();
        await this.saglikKurumuModel
          .findOneAndUpdate(
            { cbsPoiId: poi.poiId },
            {
              ad: poi.ad,
              tur,
              lat: poi.lat,
              lng: poi.lng,
              adres: adres ?? undefined,
              updatedBy,
              cbsPoiId: poi.poiId,
            },
            { upsert: true },
          )
          .exec();
        if (mevcut) guncellenen++;
        else eklenen++;
      }
    }
    return { bulunan, eklenen, guncellenen };
  }

  async findAll(): Promise<AdminSaglikKurumu[]> {
    const kurumlar = await this.saglikKurumuModel.find().sort({ ad: 1 }).exec();
    return kurumlar.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedSaglikKurumu),
    );
  }

  async findOne(id: string): Promise<AdminSaglikKurumu | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.saglikKurumuModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedSaglikKurumu) : null;
  }

  async create(
    dto: CreateSaglikKurumuDto,
    updatedBy: string,
  ): Promise<AdminSaglikKurumu> {
    const created = (await this.saglikKurumuModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedSaglikKurumu;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateSaglikKurumuDto,
    updatedBy: string,
  ): Promise<AdminSaglikKurumu | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.saglikKurumuModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedSaglikKurumu) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.saglikKurumuModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedSaglikKurumu): AdminSaglikKurumu {
    return {
      id: doc._id.toString(),
      ad: doc.ad,
      tur: doc.tur,
      adres: doc.adres ?? null,
      lat: doc.lat,
      lng: doc.lng,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
