import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateParkDto } from './dto/create-park.dto';
import { UpdateParkDto } from './dto/update-park.dto';
import { Park, ParkDocument } from './schemas/park.schema';

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
  ) {}

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
