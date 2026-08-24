import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { unlink } from 'fs/promises';
import { join } from 'path';

import { UPLOADS_DIR } from '../../uploads-dir';
import { Medya, MedyaDocument } from './schemas/medya.schema';

export interface AdminMedya {
  id: string;
  dosyaAdi: string;
  orijinalAd: string;
  mimeType: string;
  boyut: number;
  url: string;
  updatedBy: string | null;
  createdAt: string;
}

type TimestampedMedya = MedyaDocument & { createdAt: Date };

@Injectable()
export class AdminMedyaService {
  constructor(
    @InjectModel(Medya.name)
    private readonly medyaModel: Model<MedyaDocument>,
  ) {}

  async findAll(): Promise<AdminMedya[]> {
    const kayitlar = await this.medyaModel.find().sort({ createdAt: -1 }).exec();
    return kayitlar.map((doc) => this.toAdmin(doc as unknown as TimestampedMedya));
  }

  async create(
    file: Express.Multer.File,
    updatedBy: string,
  ): Promise<AdminMedya> {
    const created = (await this.medyaModel.create({
      dosyaAdi: file.filename,
      orijinalAd: file.originalname,
      mimeType: file.mimetype,
      boyut: file.size,
      url: `/uploads/${file.filename}`,
      updatedBy,
    })) as unknown as TimestampedMedya;
    return this.toAdmin(created);
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const doc = await this.medyaModel.findByIdAndDelete(id).exec();
    if (!doc) return false;
    try {
      await unlink(join(UPLOADS_DIR, doc.dosyaAdi));
    } catch {
      // Dosya diskten zaten silinmis olabilir - kayit yine de kaldirildi.
    }
    return true;
  }

  private toAdmin(doc: TimestampedMedya): AdminMedya {
    return {
      id: doc._id.toString(),
      dosyaAdi: doc.dosyaAdi,
      orijinalAd: doc.orijinalAd,
      mimeType: doc.mimeType,
      boyut: doc.boyut,
      url: doc.url,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
    };
  }
}
