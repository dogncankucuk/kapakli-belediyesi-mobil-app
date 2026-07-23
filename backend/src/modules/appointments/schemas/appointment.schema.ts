import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AppointmentDocument = HydratedDocument<Appointment>;

@Schema({ timestamps: true, collection: 'appointments' })
export class Appointment {
  // Misafir kullanıcılar da randevu alabildiği için nullable (architecture.md §3)
  @Prop({ type: String, default: null })
  userId?: string | null;

  @Prop({ required: true })
  hizmetTuru: string;

  @Prop({ required: true })
  tarih: Date;

  @Prop({ required: true })
  saat: string;

  @Prop({ required: true })
  durum: string;

  @Prop()
  updatedBy?: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
