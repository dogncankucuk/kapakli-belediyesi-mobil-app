import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AnnouncementDocument = HydratedDocument<Announcement>;

@Schema({ timestamps: true, collection: 'announcements' })
export class Announcement {
  @Prop({ required: true })
  baslik: string;

  @Prop({ required: true })
  icerik: string;

  @Prop()
  resimUrl?: string;

  @Prop({ required: true })
  yayinTarihi: Date;

  @Prop({ required: true })
  kategori: string;

  @Prop()
  updatedBy?: string;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);
