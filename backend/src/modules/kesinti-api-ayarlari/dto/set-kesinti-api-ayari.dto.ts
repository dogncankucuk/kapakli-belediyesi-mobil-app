import { IsString } from 'class-validator';

export class SetKesintiApiAyariDto {
  @IsString()
  apiUrl: string;
}
