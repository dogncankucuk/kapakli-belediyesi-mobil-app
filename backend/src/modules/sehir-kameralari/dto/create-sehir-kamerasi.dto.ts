import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateSehirKamerasiDto {
  @IsString()
  @IsNotEmpty()
  ad: string;

  @IsBoolean()
  online: boolean;
}
