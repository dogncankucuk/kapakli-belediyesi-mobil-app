import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Pharmacy, PharmacyDocument } from './schemas/pharmacy.schema';

export interface PublicPharmacy {
  id: string;
  ad: string;
  adres: string;
  telefon: string;
  nobetTarihi: string;
  lat: number;
  lng: number;
}

@Injectable()
export class PharmaciesService {
  constructor(
    @InjectModel(Pharmacy.name)
    private readonly pharmacyModel: Model<PharmacyDocument>,
  ) {}

  // Bugun nobetci olan eczaneleri dondurur (gun sinirlari yerel saat degil,
  // basitlik icin UTC gun sinirlari kullanilir - architecture.md'de netlesmemis
  // bir detay, ihtiyac halinde revize edilebilir).
  async findToday(): Promise<PublicPharmacy[]> {
    const now = new Date();
    const startOfDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    const pharmacies = await this.pharmacyModel
      .find({ nobetTarihi: { $gte: startOfDay, $lt: endOfDay } })
      .sort({ ad: 1 })
      .exec();

    return pharmacies.map((doc) => ({
      id: doc._id.toString(),
      ad: doc.ad,
      adres: doc.adres,
      telefon: doc.telefon,
      nobetTarihi: doc.nobetTarihi.toISOString(),
      lat: doc.lat,
      lng: doc.lng,
    }));
  }
}
