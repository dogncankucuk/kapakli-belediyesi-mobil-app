import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { AdminRole } from '../admin-role.enum';

export type AdminUserDocument = HydratedDocument<AdminUser>;

// Vatandaş `users` koleksiyonundan bilinçli olarak ayrı tutulur (architecture.md §9)
@Schema({ timestamps: true, collection: 'adminUsers' })
export class AdminUser {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: AdminRole })
  role: AdminRole;

  // Hassas alan: loglara/response'lara asla düz metin yazılmaz
  @Prop()
  totpSecret?: string;

  @Prop({ default: false })
  totpEnabled: boolean;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);
