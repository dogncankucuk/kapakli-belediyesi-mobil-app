import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBasvuruHizmetiDto {
  @IsString()
  @IsNotEmpty()
  baslik: string;

  @IsString()
  @IsNotEmpty()
  ozet: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hizmetler?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  kosullar?: string[];

  @IsOptional()
  @IsString()
  calismaSaatleri?: string;

  @IsOptional()
  @IsString()
  sorumluBirim?: string;

  @IsIn(['telefon', 'link'])
  basvuruTuru: string;

  @IsString()
  @IsNotEmpty()
  basvuruDegeri: string;
}
