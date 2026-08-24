import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class TeoCsvQueryDto {
  @IsString()
  @IsNotEmpty()
  ilce: string;

  @IsDateString()
  baslangic: string;

  @IsDateString()
  bitis: string;
}
