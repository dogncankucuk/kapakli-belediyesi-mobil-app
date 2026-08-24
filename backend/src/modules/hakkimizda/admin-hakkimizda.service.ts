import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UpdateHakkimizdaDto } from './dto/update-hakkimizda.dto';
import { Hakkimizda, HakkimizdaDocument } from './schemas/hakkimizda.schema';

export interface AdminHakkimizda {
  baskanOzetMetni: string;
  tarihcePhotoUrl: string | null;
  tarihceParagraflari: string[];
  kurulusYili: string;
  buyuksehirYili: string;
  nufus: string;
  updatedBy: string | null;
}

@Injectable()
export class AdminHakkimizdaService {
  constructor(
    @InjectModel(Hakkimizda.name)
    private readonly hakkimizdaModel: Model<HakkimizdaDocument>,
  ) {}

  async get(): Promise<AdminHakkimizda> {
    const doc = await this.hakkimizdaModel.findOne().exec();
    return this.toAdmin(doc);
  }

  async update(
    dto: UpdateHakkimizdaDto,
    updatedBy: string,
  ): Promise<AdminHakkimizda> {
    const doc = await this.hakkimizdaModel
      .findOneAndUpdate({}, { ...dto, updatedBy }, { new: true, upsert: true })
      .exec();
    return this.toAdmin(doc);
  }

  private toAdmin(doc: HakkimizdaDocument | null): AdminHakkimizda {
    return {
      baskanOzetMetni: doc?.baskanOzetMetni ?? '',
      tarihcePhotoUrl: doc?.tarihcePhotoUrl ?? null,
      tarihceParagraflari: doc?.tarihceParagraflari ?? [],
      kurulusYili: doc?.kurulusYili ?? '',
      buyuksehirYili: doc?.buyuksehirYili ?? '',
      nufus: doc?.nufus ?? '',
      updatedBy: doc?.updatedBy ?? null,
    };
  }
}
