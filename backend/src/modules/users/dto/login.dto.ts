import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  // T.C. kimlik no, telefon veya e-posta olabilir
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
