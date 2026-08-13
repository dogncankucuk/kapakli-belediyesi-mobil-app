import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  // ADMIN_REQUIRE_TOTP=false iken gonderilmeyebilir - bkz. auth.service.ts.
  @IsOptional()
  @IsString()
  totpToken?: string;
}
