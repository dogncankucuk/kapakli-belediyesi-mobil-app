import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateBaskanDto {
  @IsOptional()
  @IsString()
  ad?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  introText?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  maddeler?: string[];

  @IsOptional()
  @IsString()
  kapanisText?: string;
}
