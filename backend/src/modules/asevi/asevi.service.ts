import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateAseviBasvuruDto } from './dto/create-asevi-basvuru.dto';
import {
  AseviBasvuru,
  AseviBasvuruDocument,
} from './schemas/asevi-basvuru.schema';

export interface PublicAseviBasvuru {
  id: string;
}

@Injectable()
export class AseviService {
  constructor(
    @InjectModel(AseviBasvuru.name)
    private readonly aseviBasvuruModel: Model<AseviBasvuruDocument>,
  ) {}

  async create(dto: CreateAseviBasvuruDto): Promise<PublicAseviBasvuru> {
    const created = await this.aseviBasvuruModel.create(dto);
    return { id: created._id.toString() };
  }
}
