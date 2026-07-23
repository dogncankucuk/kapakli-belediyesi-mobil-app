import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateBarajDto {
  @IsString()
  @IsNotEmpty()
  ad: string;

  @IsInt()
  @Min(0)
  @Max(100)
  doluluk: number;
}
