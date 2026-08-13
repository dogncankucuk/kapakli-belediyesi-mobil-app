import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateRequestDto } from './dto/create-request.dto';
import { RequestItem, RequestDocument } from './schemas/request.schema';

export interface PublicRequest {
  id: string;
  kategori: string;
  aciklama: string;
  adSoyad: string;
  telefon: string;
  durum: string;
  ekDosyaUrl: string | null;
  lat: number | null;
  lng: number | null;
  fotograflar: string[];
  yogunluk: number | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedRequest = RequestDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(RequestItem.name)
    private readonly requestModel: Model<RequestDocument>,
  ) {}

  async create(dto: CreateRequestDto): Promise<PublicRequest> {
    const created = (await this.requestModel.create({
      kategori: dto.kategori,
      aciklama: dto.aciklama,
      adSoyad: dto.adSoyad,
      telefon: dto.telefon,
      ekDosyaUrl: dto.ekDosyaUrl ?? null,
      lat: dto.lat ?? null,
      lng: dto.lng ?? null,
      fotograflar: dto.fotograflar ?? [],
      yogunluk: dto.yogunluk ?? null,
      userId: dto.userId ?? null,
      durum: 'beklemede',
    })) as unknown as TimestampedRequest;

    return this.toPublic(created);
  }

  // Takip numarasi (Mongo ObjectId) tahmin edilemez uzunlukta oldugu icin
  // auth olmadan tekil kayit sorgusu guvenlidir - liste/arama endpoint'i YOK.
  async findOne(id: string): Promise<PublicRequest> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException();
    }

    const doc = await this.requestModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException();
    }

    return this.toPublic(doc as unknown as TimestampedRequest);
  }

  private toPublic(doc: TimestampedRequest): PublicRequest {
    return {
      id: doc._id.toString(),
      kategori: doc.kategori,
      aciklama: doc.aciklama,
      adSoyad: doc.adSoyad,
      telefon: doc.telefon,
      durum: doc.durum,
      ekDosyaUrl: doc.ekDosyaUrl ?? null,
      lat: doc.lat ?? null,
      lng: doc.lng ?? null,
      fotograflar: doc.fotograflar ?? [],
      yogunluk: doc.yogunluk ?? null,
      userId: doc.userId ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
