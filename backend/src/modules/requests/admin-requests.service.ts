import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { unlink } from 'fs/promises';
import { Model, Types } from 'mongoose';
import { join } from 'path';

import { UPLOADS_DIR } from '../../uploads-dir';
import { ListRequestsQueryDto } from './dto/list-requests-query.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestItem, RequestDocument } from './schemas/request.schema';

export interface AdminRequest {
  id: string;
  talepNo: string;
  kategori: string;
  aciklama: string;
  adSoyad: string;
  telefon: string;
  durum: string;
  ekDosyaUrl: string | null;
  lat: number | null;
  lng: number | null;
  adres: string | null;
  fotograflar: string[];
  yogunluk: number | null;
  adminNotu: string | null;
  kullaniciNotu: string | null;
  userId: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PagedAdminRequests {
  items: AdminRequest[];
  total: number;
  page: number;
  pageSize: number;
}

type TimestampedRequest = RequestDocument & {
  createdAt: Date;
  updatedAt: Date;
};

function regexKacir(deger: string): string {
  return deger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class AdminRequestsService {
  constructor(
    @InjectModel(RequestItem.name)
    private readonly requestModel: Model<RequestDocument>,
  ) {}

  // Koleksiyon buyudukce (potansiyel olarak gunde binlerce kayit) "hepsini
  // cek, tarayicida filtrele" hem backend'i hem admin panelin sekmesini
  // kilitler - filtreleme ve sayfalama burada, veritabani seviyesinde yapilir.
  async findAll(query: ListRequestsQueryDto): Promise<PagedAdminRequests> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const filter: Record<string, unknown> = {};

    if (query.kategori) filter.kategori = query.kategori;
    if (query.durum) filter.durum = query.durum;
    if (query.adSoyad) {
      filter.adSoyad = { $regex: regexKacir(query.adSoyad), $options: 'i' };
    }
    if (query.telefon) {
      filter.telefon = { $regex: regexKacir(query.telefon) };
    }
    if (query.talepNo) {
      filter.talepNo = { $regex: regexKacir(query.talepNo), $options: 'i' };
    }
    if (query.baslangic || query.bitis) {
      const createdAt: { $gte?: Date; $lte?: Date } = {};
      if (query.baslangic) createdAt.$gte = new Date(`${query.baslangic}T00:00:00.000Z`);
      if (query.bitis) createdAt.$lte = new Date(`${query.bitis}T23:59:59.999Z`);
      filter.createdAt = createdAt;
    }

    const [requests, total] = await Promise.all([
      this.requestModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.requestModel.countDocuments(filter).exec(),
    ]);

    return {
      items: requests.map((doc) => this.toAdmin(doc as unknown as TimestampedRequest)),
      total,
      page,
      pageSize,
    };
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

    const updatePayload: Record<string, unknown> = { updatedBy };
    if (dto.durum !== undefined) updatePayload.durum = dto.durum;
    if (dto.adminNotu !== undefined) {
      updatePayload.adminNotu = dto.adminNotu.trim() || null;
    }
    if (dto.kullaniciNotu !== undefined) {
      updatePayload.kullaniciNotu = dto.kullaniciNotu.trim() || null;
    }

    const doc = await this.requestModel
      .findByIdAndUpdate(id, updatePayload, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedRequest) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const doc = await this.requestModel.findByIdAndDelete(id).exec();
    if (!doc) return false;

    for (const url of doc.fotograflar ?? []) {
      if (!url.startsWith('/uploads/')) continue;
      await unlink(join(UPLOADS_DIR, url.replace('/uploads/', ''))).catch(
        () => {},
      );
    }
    return true;
  }

  private toAdmin(doc: TimestampedRequest): AdminRequest {
    return {
      id: doc._id.toString(),
      talepNo: doc.talepNo,
      kategori: doc.kategori,
      aciklama: doc.aciklama,
      adSoyad: doc.adSoyad,
      telefon: doc.telefon,
      durum: doc.durum,
      ekDosyaUrl: doc.ekDosyaUrl ?? null,
      lat: doc.lat ?? null,
      lng: doc.lng ?? null,
      adres: doc.adres ?? null,
      fotograflar: doc.fotograflar ?? [],
      yogunluk: doc.yogunluk ?? null,
      adminNotu: doc.adminNotu ?? null,
      kullaniciNotu: doc.kullaniciNotu ?? null,
      userId: doc.userId ?? null,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
