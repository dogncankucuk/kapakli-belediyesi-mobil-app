import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true })
  ad: string;

  @Prop({ required: true, trim: true })
  soyad: string;

  @Prop({ required: true, unique: true })
  tcKimlikNo: string;

  @Prop({ required: true, unique: true })
  telefon: string;

  @Prop({ lowercase: true, trim: true })
  eposta?: string;

  @Prop({ required: true })
  passwordHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
