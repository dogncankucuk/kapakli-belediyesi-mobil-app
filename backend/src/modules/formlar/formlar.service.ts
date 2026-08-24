import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  FormBelgesi,
  FormBelgesiDocument,
} from './schemas/form-belgesi.schema';

export interface PublicFormBelgesi {
  id: string;
  baslik: string;
  url: string;
  tur: string;
}

@Injectable()
export class FormlarService {
  constructor(
    @InjectModel(FormBelgesi.name)
    private readonly formBelgesiModel: Model<FormBelgesiDocument>,
  ) {}

  async findAll(): Promise<PublicFormBelgesi[]> {
    const formlar = await this.formBelgesiModel
      .find()
      .sort({ tur: 1, baslik: 1 })
      .exec();

    return formlar.map((doc) => ({
      id: doc._id.toString(),
      baslik: doc.baslik,
      url: doc.url,
      tur: doc.tur,
    }));
  }
}
