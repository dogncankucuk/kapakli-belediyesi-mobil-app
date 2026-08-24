import { IsHexColor, IsOptional, IsString } from 'class-validator';

export class UpdateTemaAyarlariDto {
  @IsOptional()
  @IsHexColor()
  primaryColorLight?: string;

  @IsOptional()
  @IsHexColor()
  secondaryColorLight?: string;

  @IsOptional()
  @IsHexColor()
  backgroundColorLight?: string;

  @IsOptional()
  @IsHexColor()
  primaryColorDark?: string;

  @IsOptional()
  @IsHexColor()
  secondaryColorDark?: string;

  @IsOptional()
  @IsHexColor()
  backgroundColorDark?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;
}
