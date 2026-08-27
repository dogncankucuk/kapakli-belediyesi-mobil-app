import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  BasvuruTuru,
  BasvuruTuruDocument,
  EkBilgiAlani,
  GerekliBelge,
} from './schemas/basvuru-turu.schema';

export interface PublicBasvuruTuru {
  id: string;
  baslik: string;
  aciklama: string | null;
  gorselUrl: string | null;
  ekBilgiAlanlari: EkBilgiAlani[];
  gerekliBelgeler: GerekliBelge[];
}

@Injectable()
export class BasvuruTurleriService {
  constructor(
    @InjectModel(BasvuruTuru.name)
    private readonly basvuruTuruModel: Model<BasvuruTuruDocument>,
  ) {}

  async findAllAktif(): Promise<PublicBasvuruTuru[]> {
    const turler = await this.basvuruTuruModel
      .find({ aktif: true })
      .sort({ baslik: 1 })
      .exec();
    return turler.map((doc) => ({
      id: doc._id.toString(),
      baslik: doc.baslik,
      aciklama: doc.aciklama ?? null,
      gorselUrl: doc.gorselUrl ?? null,
      ekBilgiAlanlari: doc.ekBilgiAlanlari ?? [],
      gerekliBelgeler: doc.gerekliBelgeler ?? [],
    }));
  }
}
