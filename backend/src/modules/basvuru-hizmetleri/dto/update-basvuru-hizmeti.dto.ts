import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateBasvuruHizmetiDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  baslik?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ozet?: string;

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

  @IsOptional()
  @IsIn(['telefon', 'link'])
  basvuruTuru?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  basvuruDegeri?: string;
}
