import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CbsKaynakService, CbsSenkronizeSonucu } from '../cbs/cbs-kaynak.service';
import { CreateEgitimKurumuDto } from './dto/create-egitim-kurumu.dto';
import { UpdateEgitimKurumuDto } from './dto/update-egitim-kurumu.dto';
import {
  EgitimKurumu,
  EgitimKurumuDocument,
} from './schemas/egitim-kurumu.schema';

// CBS katman adi -> bu koleksiyondaki "tur" degeri. Ayni okul adi birden
// fazla ilcede tekrar edebildigi icin (ör. iki ayri "Ertuğrul Gazi Anadolu
// Lisesi") ad+tur yerine CBS'in kendi poi_id'si ile eslestirme yapiliyor.
const CBS_EGITIM_KATMANLARI: Record<string, string> = {
  'gisoft:gi_poi_high_school': 'Lise',
  'gisoft:gi_poi_middle_school': 'Ortaokul',
  'gisoft:gi_poi_primary_school': 'İlkokul',
};

export interface AdminEgitimKurumu {
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

type TimestampedEgitimKurumu = EgitimKurumuDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminEgitimService {
  constructor(
    @InjectModel(EgitimKurumu.name)
    private readonly egitimKurumuModel: Model<EgitimKurumuDocument>,
    private readonly cbsKaynakService: CbsKaynakService,
  ) {}

  async cbsSenkronize(updatedBy: string): Promise<CbsSenkronizeSonucu> {
    let bulunan = 0;
    let eklenen = 0;
    let guncellenen = 0;
    for (const [typeName, tur] of Object.entries(CBS_EGITIM_KATMANLARI)) {
      const poiler = await this.cbsKaynakService.getPois(typeName);
      bulunan += poiler.length;
      for (const poi of poiler) {
        if (!poi.poiId) continue;
        const adres = await this.cbsKaynakService.getAdres(poi.districtId);
        const mevcut = await this.egitimKurumuModel
          .exists({ cbsPoiId: poi.poiId })
          .exec();
        await this.egitimKurumuModel
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

  async findAll(): Promise<AdminEgitimKurumu[]> {
    const kurumlar = await this.egitimKurumuModel.find().sort({ ad: 1 }).exec();
    return kurumlar.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedEgitimKurumu),
    );
  }

  async findOne(id: string): Promise<AdminEgitimKurumu | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.egitimKurumuModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedEgitimKurumu) : null;
  }

  async create(
    dto: CreateEgitimKurumuDto,
    updatedBy: string,
  ): Promise<AdminEgitimKurumu> {
    const created = (await this.egitimKurumuModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedEgitimKurumu;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateEgitimKurumuDto,
    updatedBy: string,
  ): Promise<AdminEgitimKurumu | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.egitimKurumuModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedEgitimKurumu) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.egitimKurumuModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedEgitimKurumu): AdminEgitimKurumu {
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
