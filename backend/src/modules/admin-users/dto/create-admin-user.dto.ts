import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { ResourcePermissionDto } from '../../roles/dto/resource-permission.dto';

export class CreateAdminUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  ad?: string;

  // true ise kullanici sistemin tek paylasilan Super Admin roluyle
  // eslestirilir (tum yetkilere sahip olur), permissions yoksayilir.
  // false/tanimsizsa asagidaki permissions ile bu kullaniciya ozel,
  // baskasiyla paylasilmayan yeni bir rol olusturulur.
  @IsOptional()
  @IsBoolean()
  isFullAccess?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourcePermissionDto)
  permissions?: ResourcePermissionDto[];

  @IsOptional()
  @IsMongoId()
  departmanId?: string | null;
}
