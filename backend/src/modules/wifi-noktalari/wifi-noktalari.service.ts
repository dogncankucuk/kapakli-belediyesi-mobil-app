import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  WifiNoktasi,
  WifiNoktasiDocument,
} from './schemas/wifi-noktasi.schema';

export interface PublicWifiNoktasi {
  id: string;
  ad: string;
  adres: string;
  kategori: string;
  lat: number;
  lng: number;
}

@Injectable()
export class WifiNoktalariService {
  constructor(
    @InjectModel(WifiNoktasi.name)
    private readonly wifiNoktasiModel: Model<WifiNoktasiDocument>,
  ) {}

  async findAll(): Promise<PublicWifiNoktasi[]> {
    const noktalar = await this.wifiNoktasiModel.find().sort({ ad: 1 }).exec();

    return noktalar.map((doc) => ({
      id: doc._id.toString(),
      ad: doc.ad,
      adres: doc.adres,
      kategori: doc.kategori,
      lat: doc.lat,
      lng: doc.lng,
    }));
  }
}
