import { IsNotEmpty, IsString } from 'class-validator';

export class CreateYardimMerkeziSoruDto {
  @IsString()
  @IsNotEmpty()
  soru: string;

  @IsString()
  @IsNotEmpty()
  cevap: string;
}
