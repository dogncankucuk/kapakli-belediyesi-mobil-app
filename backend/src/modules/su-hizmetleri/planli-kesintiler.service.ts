import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  PlanliKesinti,
  PlanliKesintiDocument,
} from './schemas/planli-kesinti.schema';

export interface PublicPlanliKesinti {
  id: string;
  tarih: string;
  ilce: string;
  aciklama: string;
}

@Injectable()
export class PlanliKesintilerService {
  constructor(
    @InjectModel(PlanliKesinti.name)
    private readonly planliKesintiModel: Model<PlanliKesintiDocument>,
  ) {}

  // Sadece bugun ve sonrasindaki kesintiler gosterilir.
  async findUpcoming(): Promise<PublicPlanliKesinti[]> {
    const bugunBasi = new Date();
    bugunBasi.setHours(0, 0, 0, 0);

    const kesintiler = await this.planliKesintiModel
      .find({ tarih: { $gte: bugunBasi } })
      .sort({ tarih: 1 })
      .exec();

    return kesintiler.map((doc) => ({
      id: doc._id.toString(),
      tarih: doc.tarih.toISOString(),
      ilce: doc.ilce,
      aciklama: doc.aciklama,
    }));
  }
}
