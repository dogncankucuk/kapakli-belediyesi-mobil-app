import { IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAdminUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  ad?: string;

  @IsMongoId()
  @IsNotEmpty()
  roleId: string;
}
