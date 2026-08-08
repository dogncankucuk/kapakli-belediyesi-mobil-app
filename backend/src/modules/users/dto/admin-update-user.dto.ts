import { IsBoolean } from 'class-validator';

export class AdminUpdateUserDto {
  @IsBoolean()
  disabled: boolean;
}
