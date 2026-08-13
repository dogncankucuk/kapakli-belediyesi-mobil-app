import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ClassifyAtikDto {
  // Data URI onekiyle ("data:image/jpeg;base64,...") veya oneksiz, ham
  // base64 olarak gonderilebilir - servis her ikisini de kabul ediyor.
  @IsString()
  @IsNotEmpty()
  image: string;

  @IsOptional()
  @IsIn(['image/jpeg', 'image/png', 'image/webp'])
  mediaType?: 'image/jpeg' | 'image/png' | 'image/webp';
}
