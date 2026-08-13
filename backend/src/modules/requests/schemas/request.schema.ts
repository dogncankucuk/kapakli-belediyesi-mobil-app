import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RequestDocument = HydratedDocument<RequestItem>;

@Schema({ timestamps: true, collection: 'requests' })
export class RequestItem {
  // Misafir kullanıcılar da talep oluşturabildiği için nullable (architecture.md §3)
  @Prop({ type: String, default: null })
  userId?: string | null;

  @Prop({ required: true })
  kategori: string;

  @Prop({ required: true })
  aciklama: string;

  @Prop({ required: true })
  adSoyad: string;

  @Prop({ required: true })
  telefon: string;

  @Prop({ required: true })
  durum: string;

  @Prop({ type: String, default: null })
  ekDosyaUrl?: string | null;

  @Prop({ type: Number, default: null })
  lat?: number | null;

  @Prop({ type: Number, default: null })
  lng?: number | null;

  @Prop({ type: [String], default: [] })
  fotograflar?: string[];

  @Prop({ type: Number, default: null })
  yogunluk?: number | null;

  @Prop()
  updatedBy?: string;
}

export const RequestSchema = SchemaFactory.createForClass(RequestItem);
