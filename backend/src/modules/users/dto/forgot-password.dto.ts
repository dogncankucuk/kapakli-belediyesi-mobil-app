import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  // T.C. kimlik no, telefon veya e-posta olabilir
  @IsString()
  @IsNotEmpty()
  identifier: string;
}
