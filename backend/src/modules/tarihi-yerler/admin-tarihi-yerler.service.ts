import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateTarihiYerDto } from './dto/create-tarihi-yer.dto';
import { UpdateTarihiYerDto } from './dto/update-tarihi-yer.dto';
import { TarihiYer, TarihiYerDocument } from './schemas/tarihi-yer.schema';

export interface AdminTarihiYer {
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

type TimestampedTarihiYer = TarihiYerDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminTarihiYerlerService {
  constructor(
    @InjectModel(TarihiYer.name)
    private readonly tarihiYerModel: Model<TarihiYerDocument>,
  ) {}

  async findAll(): Promise<AdminTarihiYer[]> {
    const yerler = await this.tarihiYerModel.find().sort({ ad: 1 }).exec();
    return yerler.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedTarihiYer),
    );
  }

  async findOne(id: string): Promise<AdminTarihiYer | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.tarihiYerModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedTarihiYer) : null;
  }

  async create(
    dto: CreateTarihiYerDto,
    updatedBy: string,
  ): Promise<AdminTarihiYer> {
    const created = (await this.tarihiYerModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedTarihiYer;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateTarihiYerDto,
    updatedBy: string,
  ): Promise<AdminTarihiYer | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.tarihiYerModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedTarihiYer) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.tarihiYerModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedTarihiYer): AdminTarihiYer {
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
