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

  // Gercek nobetci eczane bilgisi NobetciEczanelerScreen'de belediyenin kendi
  // canli sayfasi (kapakli.bel.tr/kapakli-nobetci-eczaneler) WebView ile
  // gosteriliyor - bu koleksiyon/servis onu tekrar etmiyor, sadece haritadaki
  // Eczaneler katmani icin TUM eczane konumlarini dondurur (nobetTarihi alani
  // hala schema'da duruyor ama burada filtre olarak kullanilmiyor).
  async findAll(): Promise<PublicPharmacy[]> {
    const pharmacies = await this.pharmacyModel.find().sort({ ad: 1 }).exec();

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
