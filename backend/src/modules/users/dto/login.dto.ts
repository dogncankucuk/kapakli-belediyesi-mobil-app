import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  // Sadece T.C. kimlik no kabul edilir (telefon/e-posta ile giris yok).
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
