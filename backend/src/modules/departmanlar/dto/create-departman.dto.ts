import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

import { ResourcePermissionDto } from '../../roles/dto/resource-permission.dto';

export class CreateDepartmanDto {
  @IsString()
  @IsNotEmpty()
  ad: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourcePermissionDto)
  varsayilanYetkiler?: ResourcePermissionDto[];
}
