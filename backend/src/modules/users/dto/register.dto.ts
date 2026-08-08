import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

import { IsValidTcKimlikNo } from '../validators/tc-kimlik-no.validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  ad: string;

  @IsString()
  @IsNotEmpty()
  soyad: string;

  @IsString()
  @IsValidTcKimlikNo()
  tcKimlikNo: string;

  @IsString()
  @IsNotEmpty()
  telefon: string;

  @IsOptional()
  @IsEmail()
  eposta?: string;

  @IsString()
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalı' })
  @Matches(/(?=.*[A-Za-zÇĞİÖŞÜçğıöşü])(?=.*\d)/, {
    message: 'Şifre en az bir harf ve bir rakam içermeli',
  })
  password: string;
}
