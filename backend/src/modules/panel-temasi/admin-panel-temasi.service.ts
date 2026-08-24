import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UpdatePanelTemasiDto } from './dto/update-panel-temasi.dto';
import { PanelTemasi, PanelTemasiDocument } from './schemas/panel-temasi.schema';

export interface AdminPanelTemasi {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
  fontFamily: string;
  radius: number;
  updatedBy: string | null;
}

const DEFAULTS: Omit<AdminPanelTemasi, 'updatedBy'> = {
  primaryColor: '#1F5C56',
  secondaryColor: '#3E7D74',
  backgroundColor: '#FBF7F1',
  surfaceColor: '#FFFFFF',
  textColor: '#22302C',
  borderColor: '#E4DFD6',
  fontFamily: "'Segoe UI', system-ui, Roboto, sans-serif",
  radius: 10,
};

@Injectable()
export class AdminPanelTemasiService {
  constructor(
    @InjectModel(PanelTemasi.name)
    private readonly panelTemasiModel: Model<PanelTemasiDocument>,
  ) {}

  async get(): Promise<AdminPanelTemasi> {
    const doc = await this.panelTemasiModel.findOne().exec();
    return this.toAdmin(doc);
  }

  async update(
    dto: UpdatePanelTemasiDto,
    updatedBy: string,
  ): Promise<AdminPanelTemasi> {
    const doc = await this.panelTemasiModel
      .findOneAndUpdate({}, { ...dto, updatedBy }, { new: true, upsert: true })
      .exec();
    return this.toAdmin(doc);
  }

  private toAdmin(doc: PanelTemasiDocument | null): AdminPanelTemasi {
    return {
      primaryColor: doc?.primaryColor ?? DEFAULTS.primaryColor,
      secondaryColor: doc?.secondaryColor ?? DEFAULTS.secondaryColor,
      backgroundColor: doc?.backgroundColor ?? DEFAULTS.backgroundColor,
      surfaceColor: doc?.surfaceColor ?? DEFAULTS.surfaceColor,
      textColor: doc?.textColor ?? DEFAULTS.textColor,
      borderColor: doc?.borderColor ?? DEFAULTS.borderColor,
      fontFamily: doc?.fontFamily ?? DEFAULTS.fontFamily,
      radius: doc?.radius ?? DEFAULTS.radius,
      updatedBy: doc?.updatedBy ?? null,
    };
  }
}
