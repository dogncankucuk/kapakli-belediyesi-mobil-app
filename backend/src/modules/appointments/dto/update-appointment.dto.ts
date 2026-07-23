import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  durum?: string;

  @IsOptional()
  @IsDateString()
  tarih?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  saat?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  hizmetTuru?: string;
}
