import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Pharmacy, PharmacyDocument } from './schemas/pharmacy.schema';

export interface PublicPharmacy {
  id: string;
  ad: string;
  adres: string;
  adresTarifi: string | null;
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

  // Haritadaki Eczaneler katmani icin TUM eczane konumlarini dondurur
  // (nobetTarihi burada filtre olarak kullanilmiyor - bkz. findNobetci).
  async findAll(): Promise<PublicPharmacy[]> {
    const pharmacies = await this.pharmacyModel.find().sort({ ad: 1 }).exec();

    return pharmacies.map((doc) => this.toPublic(doc));
  }

  // "Nobetci Eczaneler" ekrani icin: nobetTarihi'nin takvim gunu bugune denk
  // gelen kayitlar. Bu alan artik sadece admin panelden elle giriliyor
  // (bkz. AdminPharmaciesController) - otomatik kazima/senkron yok.
  async findNobetci(): Promise<PublicPharmacy[]> {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );

    const pharmacies = await this.pharmacyModel
      .find({ nobetTarihi: { $gte: startOfDay, $lt: endOfDay } })
      .sort({ ad: 1 })
      .exec();

    return pharmacies.map((doc) => this.toPublic(doc));
  }

  private toPublic(doc: PharmacyDocument): PublicPharmacy {
    return {
      id: doc._id.toString(),
      ad: doc.ad,
      adres: doc.adres,
      adresTarifi: doc.adresTarifi ?? null,
      telefon: doc.telefon,
      nobetTarihi: doc.nobetTarihi.toISOString(),
      lat: doc.lat,
      lng: doc.lng,
    };
  }
}
