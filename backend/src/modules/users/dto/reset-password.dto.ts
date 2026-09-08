import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @Length(6, 6)
  code: string;

  @IsString()
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalı' })
  @Matches(
    /^(?=.*[a-zçğıöşü])(?=.*[A-ZÇĞİÖŞÜ])(?=.*\d)(?=.*[^\wçğıöşüÇĞİÖŞÜ\s]).{8,}$/,
    {
      message:
        'Şifre en az 8 karakter olmalı, en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 noktalama işareti içermeli',
    },
  )
  newPassword: string;
}
