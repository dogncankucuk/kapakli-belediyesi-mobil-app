import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  mevcutSifre: string;

  @IsString()
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalı' })
  @Matches(
    /^(?=.*[a-zçğıöşü])(?=.*[A-ZÇĞİÖŞÜ])(?=.*\d)(?=.*[^\wçğıöşüÇĞİÖŞÜ\s]).{8,}$/,
    {
      message:
        'Şifre en az 8 karakter olmalı, en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 noktalama işareti içermeli',
    },
  )
  yeniSifre: string;
}
