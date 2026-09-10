import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CbsKaynakService, CbsSenkronizeSonucu } from '../cbs/cbs-kaynak.service';
import { CreateParkDto } from './dto/create-park.dto';
import { UpdateParkDto } from './dto/update-park.dto';
import { Park, ParkDocument } from './schemas/park.schema';

const CBS_PARK_KATMANI = 'gisoft:gi_prk_park_const';
const CBS_PARK_AD_ALANI = 'park_name';

export interface AdminPark {
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

type TimestampedPark = ParkDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminParklarService {
  constructor(
    @InjectModel(Park.name)
    private readonly parkModel: Model<ParkDocument>,
    private readonly cbsKaynakService: CbsKaynakService,
  ) {}

  // CBS'teki park sinirlari poligon oldugu icin CbsKaynakService bunlarin
  // merkez noktasini (centroid) hesaplayip Point gibi donduruyor. Park adi
  // tek basina guvenilir bir anahtar degil (ör. iki ayri "ÖZEN MENSUCAT"
  // parki), bu yuzden CBS'in kendi park_id'siyle eslestirme yapiliyor.
  async cbsSenkronize(updatedBy: string): Promise<CbsSenkronizeSonucu> {
    const poiler = await this.cbsKaynakService.getPois(
      CBS_PARK_KATMANI,
      CBS_PARK_AD_ALANI,
    );
    let eklenen = 0;
    let guncellenen = 0;
    for (const poi of poiler) {
      if (!poi.poiId) continue;
      const adres = await this.cbsKaynakService.getAdres(poi.districtId);
      // CBS'teki bazi park adlari zaten "PARKI" ile bitiyor (ör. "NEŞET
      // ERTAŞ PARKI") - bu durumda tekrar eklemiyoruz.
      const zatenParkiIleBitiyor = poi.ad
        .toLocaleUpperCase('tr-TR')
        .trim()
        .endsWith('PARKI');
      const ad = zatenParkiIleBitiyor
        ? this.cbsKaynakService.baslikYap(poi.ad)
        : `${this.cbsKaynakService.baslikYap(poi.ad)} Parkı`;
      const mevcut = await this.parkModel
        .exists({ cbsPoiId: poi.poiId })
        .exec();
      await this.parkModel
        .findOneAndUpdate(
          { cbsPoiId: poi.poiId },
          {
            ad,
            tur: 'Park',
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
    return { bulunan: poiler.length, eklenen, guncellenen };
  }

  async findAll(): Promise<AdminPark[]> {
    const parklar = await this.parkModel.find().sort({ ad: 1 }).exec();
    return parklar.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedPark),
    );
  }

  async findOne(id: string): Promise<AdminPark | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.parkModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedPark) : null;
  }

  async create(dto: CreateParkDto, updatedBy: string): Promise<AdminPark> {
    const created = (await this.parkModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedPark;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateParkDto,
    updatedBy: string,
  ): Promise<AdminPark | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.parkModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedPark) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.parkModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedPark): AdminPark {
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
