import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PushTokenDocument = HydratedDocument<PushToken>;

@Schema({ timestamps: true, collection: 'push_tokens' })
export class PushToken {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true, enum: ['ios', 'android'] })
  platform: 'ios' | 'android';
}

export const PushTokenSchema = SchemaFactory.createForClass(PushToken);
