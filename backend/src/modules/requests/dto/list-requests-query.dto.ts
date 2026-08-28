import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

import { TALEP_KATEGORILERI } from './create-request.dto';
import { TALEP_DURUMLARI } from './update-request.dto';

// Talepler koleksiyonu buyudukce (bkz. admin panel Talepler sayfasi) "hepsini
// cek, tarayicida filtrele" yaklasimi hem backend'i hem tarayiciyi kilitler -
// bu yuzden filtreleme ve sayfalama backend'e tasindi.
export class ListRequestsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  pageSize?: number = 50;

  @IsOptional()
  @IsIn(TALEP_KATEGORILERI)
  kategori?: string;

  @IsOptional()
  @IsIn(TALEP_DURUMLARI)
  durum?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  adSoyad?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  talepNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  baslangic?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  bitis?: string;
}
