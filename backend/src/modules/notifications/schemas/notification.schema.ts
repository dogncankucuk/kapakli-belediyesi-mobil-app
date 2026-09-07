import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  kategori: string;

  @Prop({ required: true })
  baslik: string;

  @Prop({ required: true })
  govde: string;

  @Prop({ type: String, default: null })
  iliskiliTip?: string | null;

  @Prop({ type: String, default: null })
  iliskiliId?: string | null;

  @Prop({ default: false })
  okunduMu: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Mobil bildirim listesi kullaniciya gore filtrelenip en yeniye gore
// siralanacak (bkz. mobil entegrasyon subtask'i) - request.schema.ts'deki
// createdAt indexiyle ayni gerekce.
NotificationSchema.index({ userId: 1, createdAt: -1 });
