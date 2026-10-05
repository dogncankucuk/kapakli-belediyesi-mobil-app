import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { ResourcePermissionDto } from '../../roles/dto/resource-permission.dto';

export class UpdateAdminUserDto {
  @IsOptional()
  @IsString()
  ad?: string;

  // true/false gonderilirse kullanicinin tam yetkili (Super Admin) durumu
  // degistirilir - bkz. AdminUsersService.update (dedicated rol yasam
  // dongusu yonetimi). Gonderilmezse mevcut durum korunur.
  @IsOptional()
  @IsBoolean()
  isFullAccess?: boolean;

  // Gonderilirse (isFullAccess=false/mevcut durumdayken) kullanicinin kendi
  // rolune yazilir - bkz. AdminUsersService.update.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourcePermissionDto)
  permissions?: ResourcePermissionDto[];

  @IsOptional()
  @IsMongoId()
  departmanId?: string | null;

  @IsOptional()
  @IsBoolean()
  disabled?: boolean;

  // Doldurulursa sifre sifirlanir - bos birakilirsa mevcut sifre korunur.
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
