import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GununMenusuDocument = HydratedDocument<GununMenusu>;

@Schema({ _id: false })
export class MenuKalemi {
  @Prop({ required: true })
  ad: string;

  @Prop({ required: true })
  aciklama: string;
}

export const MenuKalemiSchema = SchemaFactory.createForClass(MenuKalemi);

@Schema({ timestamps: true, collection: 'gununMenuleri' })
export class GununMenusu {
  @Prop({ required: true })
  tarih: Date;

  @Prop({ type: [MenuKalemiSchema], required: true })
  kalemler: MenuKalemi[];

  @Prop({ required: true })
  fiyat: number;

  @Prop()
  updatedBy?: string;
}

export const GununMenusuSchema = SchemaFactory.createForClass(GununMenusu);
