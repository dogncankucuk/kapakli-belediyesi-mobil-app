import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreatePlanliKesintiDto {
  @IsDateString()
  tarih: string;

  @IsString()
  @IsNotEmpty()
  ilce: string;

  @IsString()
  @IsNotEmpty()
  aciklama: string;
}
