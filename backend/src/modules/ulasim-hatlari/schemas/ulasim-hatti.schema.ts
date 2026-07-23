import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UlasimHattiDocument = HydratedDocument<UlasimHatti>;

// Not: gercek GPS/canli konum takibi entegre degil (bkz. architecture.md
// acik konular) - "durum" alani admin tarafindan elle guncellenen bir metindir.
@Schema({ timestamps: true, collection: 'ulasimHatlari' })
export class UlasimHatti {
  @Prop({ required: true })
  hatAdi: string;

  @Prop({ required: true })
  guzergah: string;

  @Prop({ required: true })
  durum: string;

  @Prop({ required: true, default: false })
  canli: boolean;

  @Prop()
  updatedBy?: string;
}

export const UlasimHattiSchema = SchemaFactory.createForClass(UlasimHatti);
