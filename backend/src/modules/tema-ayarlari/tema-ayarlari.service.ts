import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { TemaAyarlari, TemaAyarlariDocument } from './schemas/tema-ayarlari.schema';

export interface PublicTemaAyarlari {
  primaryColorLight: string;
  secondaryColorLight: string;
  backgroundColorLight: string;
  primaryColorDark: string;
  secondaryColorDark: string;
  backgroundColorDark: string;
  fontFamily: string;
}

const DEFAULTS: PublicTemaAyarlari = {
  primaryColorLight: '#1F5C56',
  secondaryColorLight: '#3E7D74',
  backgroundColorLight: '#FBF7F1',
  primaryColorDark: '#7FC9BC',
  secondaryColorDark: '#6FB3A6',
  backgroundColorDark: '#12201D',
  fontFamily: 'System',
};

@Injectable()
export class TemaAyarlariService {
  constructor(
    @InjectModel(TemaAyarlari.name)
    private readonly temaAyarlariModel: Model<TemaAyarlariDocument>,
  ) {}

  async get(): Promise<PublicTemaAyarlari> {
    const doc = await this.temaAyarlariModel.findOne().exec();
    return {
      primaryColorLight: doc?.primaryColorLight ?? DEFAULTS.primaryColorLight,
      secondaryColorLight:
        doc?.secondaryColorLight ?? DEFAULTS.secondaryColorLight,
      backgroundColorLight:
        doc?.backgroundColorLight ?? DEFAULTS.backgroundColorLight,
      primaryColorDark: doc?.primaryColorDark ?? DEFAULTS.primaryColorDark,
      secondaryColorDark:
        doc?.secondaryColorDark ?? DEFAULTS.secondaryColorDark,
      backgroundColorDark:
        doc?.backgroundColorDark ?? DEFAULTS.backgroundColorDark,
      fontFamily: doc?.fontFamily ?? DEFAULTS.fontFamily,
    };
  }
}
