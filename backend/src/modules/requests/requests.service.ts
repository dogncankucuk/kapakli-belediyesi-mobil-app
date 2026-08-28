import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';
import { Model, Types } from 'mongoose';
import { join } from 'path';

import { UPLOADS_DIR } from '../../uploads-dir';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestCounter, RequestCounterDocument } from './schemas/request-counter.schema';
import { RequestItem, RequestDocument } from './schemas/request.schema';

export interface PublicRequest {
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
  kullaniciNotu: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedRequest = RequestDocument & {
  createdAt: Date;
  updatedAt: Date;
};

// Talep numarasi "{kategoriKodu}-{siraNo}" formatinda - kod, kategoriye
// bakmadan hangi turden talep oldugunu anlamayi saglar (admin panel Talepler
// sayfasinda hem numaradan hem Kategori sutunundan gorunur). Eski/artik
// kullanilmayan 3 kategori de (ariza-bakim/sikayet/gorus-oneri) gecmis
// kayitlarla tutarlilik icin bir koda sahip.
const TALEP_KATEGORI_KODLARI: Record<string, string> = {
  cevre: '01',
  hava: '02',
  gurultu: '03',
  atik: '04',
  altyapi: '05',
  diger: '06',
  'ariza-bakim': '07',
  sikayet: '08',
  'gorus-oneri': '09',
};

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(RequestItem.name)
    private readonly requestModel: Model<RequestDocument>,
    @InjectModel(RequestCounter.name)
    private readonly counterModel: Model<RequestCounterDocument>,
  ) {}

  private async nextTalepNo(kategori: string): Promise<string> {
    const kod = TALEP_KATEGORI_KODLARI[kategori] ?? '00';
    const counter = await this.counterModel
      .findOneAndUpdate(
        { kategori },
        { $inc: { seq: 1 } },
        { upsert: true, new: true },
      )
      .exec();
    return `${kod}-${String(counter.seq).padStart(6, '0')}`;
  }

  // Mobil uygulama fotograflari base64 olarak gonderiyor ama bunlari Mongo
  // dokumaninin icinde tutmak (onceki davranis) koleksiyonu hizla sisirip
  // "hepsini cek" sorgusunu (findAll) devasa yapardi - bunun yerine medya
  // kutuphanesiyle ayni /uploads klasorune dosya olarak yaziliyor, dokumanda
  // sadece goreceli URL kaliyor.
  private async fotograflariKaydet(base64Listesi: string[]): Promise<string[]> {
    const urller: string[] = [];
    for (const base64 of base64Listesi) {
      const dosyaAdi = `${randomUUID()}.jpg`;
      await writeFile(join(UPLOADS_DIR, dosyaAdi), Buffer.from(base64, 'base64'));
      urller.push(`/uploads/${dosyaAdi}`);
    }
    return urller;
  }

  async create(dto: CreateRequestDto): Promise<PublicRequest> {
    const [talepNo, fotograflar] = await Promise.all([
      this.nextTalepNo(dto.kategori),
      this.fotograflariKaydet(dto.fotograflar ?? []),
    ]);
    const created = (await this.requestModel.create({
      talepNo,
      kategori: dto.kategori,
      aciklama: dto.aciklama,
      adSoyad: dto.adSoyad,
      telefon: dto.telefon,
      ekDosyaUrl: dto.ekDosyaUrl ?? null,
      lat: dto.lat ?? null,
      lng: dto.lng ?? null,
      adres: dto.adres ?? null,
      fotograflar,
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
      kullaniciNotu: doc.kullaniciNotu ?? null,
      userId: doc.userId ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
