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
  @Matches(/^5\d{9}$/, {
    message: 'Telefon numarası 5 ile başlayan 10 haneli olmalı (örn. 5321234567)',
  })
  telefon: string;

  @IsOptional()
  @IsEmail()
  eposta?: string;

  @IsString()
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalı' })
  @Matches(
    /^(?=.*[a-zçğıöşü])(?=.*[A-ZÇĞİÖŞÜ])(?=.*\d)(?=.*[^\wçğıöşüÇĞİÖŞÜ\s]).{8,}$/,
    {
      message:
        'Şifre en az 8 karakter olmalı, en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 noktalama işareti içermeli',
    },
  )
  password: string;
}
