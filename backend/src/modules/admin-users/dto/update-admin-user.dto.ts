import {
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateAdminUserDto {
  @IsOptional()
  @IsString()
  ad?: string;

  @IsOptional()
  @IsMongoId()
  roleId?: string;

  @IsOptional()
  @IsBoolean()
  disabled?: boolean;

  // Doldurulursa sifre sifirlanir - bos birakilirsa mevcut sifre korunur.
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
