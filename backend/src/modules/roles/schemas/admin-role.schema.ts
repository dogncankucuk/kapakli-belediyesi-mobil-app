import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AdminRoleDocument = HydratedDocument<AdminRole>;

export type PermissionAction = 'list' | 'show' | 'create' | 'edit' | 'delete';

@Schema({ _id: false })
export class ResourcePermission {
  @Prop({ required: true })
  resource: string;

  @Prop({ type: [String], default: [] })
  actions: PermissionAction[];
}

export const ResourcePermissionSchema =
  SchemaFactory.createForClass(ResourcePermission);

// Dinamik rol tanimi - eskiden koda sabit yazilan AdminRole enum'unun
// yerini alir. "Sifreleme" degil, yetkilendirme: hangi rolun hangi
// kaynakta (resource) hangi eylemleri (list/show/create/edit/delete)
// yapabilecegini tutar. isFullAccess=true olan rol (Sistem Super Admin'i)
// bu listeyi hic kontrol etmeden her seye erisir - kilitlenmeyi onlemek
// icin silinemez/degistirilemez (bkz. isProtected).
@Schema({ timestamps: true, collection: 'adminRoles' })
export class AdminRole {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ default: false })
  isFullAccess: boolean;

  // Sistem tarafindan olusturulan, silinmesi/isFullAccess'i kapatilmasi
  // engellenen roller icin (ilk seed edilen Super Admin rolu).
  @Prop({ default: false })
  isProtected: boolean;

  @Prop({ type: [ResourcePermissionSchema], default: [] })
  permissions: ResourcePermission[];

  @Prop()
  updatedBy?: string;
}

export const AdminRoleSchema = SchemaFactory.createForClass(AdminRole);
