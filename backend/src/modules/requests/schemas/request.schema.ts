import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RequestDocument = HydratedDocument<RequestItem>;

@Schema({ timestamps: true, collection: 'requests' })
export class RequestItem {
  // Kategori koduyla baslayan, kategori basina siral talep numarasi
  // (ör. "02-000014" = 14. "hava" talebi) - bkz. RequestsService.create().
  @Prop({ required: true, unique: true })
  talepNo: string;

  // Misafir kullanıcılar da talep oluşturabildiği için nullable (architecture.md §3)
  @Prop({ type: String, default: null })
  userId?: string | null;

  @Prop({ required: true, index: true })
  kategori: string;

  @Prop({ required: true })
  aciklama: string;

  @Prop({ required: true })
  adSoyad: string;

  @Prop({ required: true })
  telefon: string;

  @Prop({ required: true, index: true })
  durum: string;

  @Prop({ type: String, default: null })
  ekDosyaUrl?: string | null;

  @Prop({ type: Number, default: null })
  lat?: number | null;

  @Prop({ type: Number, default: null })
  lng?: number | null;

  @Prop({ type: String, default: null })
  adres?: string | null;

  @Prop({ type: [String], default: [] })
  fotograflar?: string[];

  @Prop({ type: Number, default: null })
  yogunluk?: number | null;

  @Prop({ trim: true })
  adminNotu?: string;

  @Prop({ trim: true })
  kullaniciNotu?: string;

  @Prop()
  updatedBy?: string;
}

export const RequestSchema = SchemaFactory.createForClass(RequestItem);

// Admin panel Talepler sayfasi varsayilan olarak en yeniye gore siraliyor ve
// tarih araligina gore filtreliyor - bu index olmadan koleksiyon buyudukce
// findAll() yavaslar.
RequestSchema.index({ createdAt: -1 });
