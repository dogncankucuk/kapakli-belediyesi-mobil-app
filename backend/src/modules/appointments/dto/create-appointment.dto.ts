import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  hizmetTuru: string;

  @IsDateString()
  tarih: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  saat: string;

  @IsOptional()
  @IsString()
  userId?: string | null;
}
