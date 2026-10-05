import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMedyaKlasoruDto {
  @IsString()
  @IsNotEmpty()
  ad: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gorunurDepartmanlar?: string[];
}
