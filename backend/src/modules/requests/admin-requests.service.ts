import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestItem, RequestDocument } from './schemas/request.schema';

export interface AdminRequest {
  id: string;
  kategori: string;
  aciklama: string;
  adSoyad: string;
  telefon: string;
  durum: string;
  ekDosyaUrl: string | null;
  userId: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedRequest = RequestDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminRequestsService {
  constructor(
    @InjectModel(RequestItem.name)
    private readonly requestModel: Model<RequestDocument>,
  ) {}

  async findAll(): Promise<AdminRequest[]> {
    const requests = await this.requestModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
    return requests.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedRequest),
    );
  }

  async findOne(id: string): Promise<AdminRequest | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.requestModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedRequest) : null;
  }

  async update(
    id: string,
    dto: UpdateRequestDto,
    updatedBy: string,
  ): Promise<AdminRequest | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.requestModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedRequest) : null;
  }

  private toAdmin(doc: TimestampedRequest): AdminRequest {
    return {
      id: doc._id.toString(),
      kategori: doc.kategori,
      aciklama: doc.aciklama,
      adSoyad: doc.adSoyad,
      telefon: doc.telefon,
      durum: doc.durum,
      ekDosyaUrl: doc.ekDosyaUrl ?? null,
      userId: doc.userId ?? null,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
