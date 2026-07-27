import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  ad: string;

  @IsString()
  @IsNotEmpty()
  soyad: string;

  @IsString()
  @Length(11, 11)
  tcKimlikNo: string;

  @IsString()
  @IsNotEmpty()
  telefon: string;

  @IsOptional()
  @IsEmail()
  eposta?: string;

  @IsString()
  @MinLength(6)
  password: string;
}
