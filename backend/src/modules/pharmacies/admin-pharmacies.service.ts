import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import { Pharmacy, PharmacyDocument } from './schemas/pharmacy.schema';

export interface AdminPharmacy {
  id: string;
  ad: string;
  adres: string;
  telefon: string;
  nobetTarihi: string;
  lat: number;
  lng: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedPharmacy = PharmacyDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminPharmaciesService {
  constructor(
    @InjectModel(Pharmacy.name)
    private readonly pharmacyModel: Model<PharmacyDocument>,
  ) {}

  async findAll(): Promise<AdminPharmacy[]> {
    const pharmacies = await this.pharmacyModel
      .find()
      .sort({ nobetTarihi: -1 })
      .exec();
    return pharmacies.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedPharmacy),
    );
  }

  async findOne(id: string): Promise<AdminPharmacy | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.pharmacyModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedPharmacy) : null;
  }

  async create(
    dto: CreatePharmacyDto,
    updatedBy: string,
  ): Promise<AdminPharmacy> {
    const created = (await this.pharmacyModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedPharmacy;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdatePharmacyDto,
    updatedBy: string,
  ): Promise<AdminPharmacy | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.pharmacyModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedPharmacy) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.pharmacyModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedPharmacy): AdminPharmacy {
    return {
      id: doc._id.toString(),
      ad: doc.ad,
      adres: doc.adres,
      telefon: doc.telefon,
      nobetTarihi: doc.nobetTarihi.toISOString(),
      lat: doc.lat,
      lng: doc.lng,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
