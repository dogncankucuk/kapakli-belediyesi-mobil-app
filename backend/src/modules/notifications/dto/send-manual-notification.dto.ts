import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendManualNotificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  baslik: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  govde: string;

  @IsOptional()
  @IsString()
  fotografUrl?: string;
}
