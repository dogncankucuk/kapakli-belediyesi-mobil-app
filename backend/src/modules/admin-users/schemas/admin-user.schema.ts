import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AdminUserDocument = HydratedDocument<AdminUser>;

// Vatandaş `users` koleksiyonundan bilinçli olarak ayrı tutulur (architecture.md §9)
@Schema({ timestamps: true, collection: 'adminUsers' })
export class AdminUser {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  ad?: string;

  // Roller artik dinamik (bkz. modules/roles) - sabit enum yerine referans.
  @Prop({ required: true, type: Types.ObjectId, ref: 'AdminRole' })
  roleId: Types.ObjectId;

  // Pasife alinan kullanici giris yapamaz (bkz. auth.service.ts) ama kaydi
  // silinmez - gecmis updatedBy referanslari icin.
  @Prop({ default: false })
  disabled: boolean;

  // Hassas alan: loglara/response'lara asla düz metin yazılmaz
  @Prop()
  totpSecret?: string;

  @Prop({ default: false })
  totpEnabled: boolean;

  @Prop()
  updatedBy?: string;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);
