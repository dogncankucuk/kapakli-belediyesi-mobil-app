import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateWifiNoktasiDto } from './dto/create-wifi-noktasi.dto';
import { UpdateWifiNoktasiDto } from './dto/update-wifi-noktasi.dto';
import {
  WifiNoktasi,
  WifiNoktasiDocument,
} from './schemas/wifi-noktasi.schema';

export interface AdminWifiNoktasi {
  id: string;
  ad: string;
  adres: string;
  kategori: string;
  lat: number;
  lng: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedWifiNoktasi = WifiNoktasiDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminWifiNoktalariService {
  constructor(
    @InjectModel(WifiNoktasi.name)
    private readonly wifiNoktasiModel: Model<WifiNoktasiDocument>,
  ) {}

  async findAll(): Promise<AdminWifiNoktasi[]> {
    const noktalar = await this.wifiNoktasiModel.find().sort({ ad: 1 }).exec();
    return noktalar.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedWifiNoktasi),
    );
  }

  async findOne(id: string): Promise<AdminWifiNoktasi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.wifiNoktasiModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedWifiNoktasi) : null;
  }

  async create(
    dto: CreateWifiNoktasiDto,
    updatedBy: string,
  ): Promise<AdminWifiNoktasi> {
    const created = (await this.wifiNoktasiModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedWifiNoktasi;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateWifiNoktasiDto,
    updatedBy: string,
  ): Promise<AdminWifiNoktasi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.wifiNoktasiModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedWifiNoktasi) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.wifiNoktasiModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedWifiNoktasi): AdminWifiNoktasi {
    return {
      id: doc._id.toString(),
      ad: doc.ad,
      adres: doc.adres,
      kategori: doc.kategori,
      lat: doc.lat,
      lng: doc.lng,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
