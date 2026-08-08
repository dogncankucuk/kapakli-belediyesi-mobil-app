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
  @Matches(/(?=.*[A-Za-zÇĞİÖŞÜçğıöşü])(?=.*\d)/, {
    message: 'Şifre en az bir harf ve bir rakam içermeli',
  })
  newPassword: string;
}
