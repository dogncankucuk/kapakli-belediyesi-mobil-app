import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import {
  ResourcePermission,
  ResourcePermissionSchema,
} from '../../roles/schemas/admin-role.schema';

export type DepartmanDocument = HydratedDocument<Departman>;

// Roller (izin/yetki seti) ile bilincli olarak ayri bir kavram: departman
// sadece organizasyonel bir gruplama (personelin hangi birimde calistigi).
// Bir yonetici kullaniciya HEM rol HEM departman atanir - bkz. AdminUser
// schema'sindaki departmanId. Medya klasor gorunurlugu de departmana gore
// kisitlanir (bkz. MedyaKlasoru.gorunurDepartmanlar).
@Schema({ timestamps: true, collection: 'departmanlar' })
export class Departman {
  @Prop({ required: true, unique: true, trim: true })
  ad: string;

  // Yeni kullanici olustururken bu departman secildiginde yetki matrisini
  // ON-DOLDURMAK icin kullanilan sablon (oneri niteliginde - admin kullanici
  // bazinda degistirebilir, kaydedilen asil yetki kullanicinin kendi
  // rolune yazilir, bu alan sadece bir baslangic noktasidir).
  @Prop({ type: [ResourcePermissionSchema], default: [] })
  varsayilanYetkiler: ResourcePermission[];

  @Prop()
  updatedBy?: string;
}

export const DepartmanSchema = SchemaFactory.createForClass(Departman);
