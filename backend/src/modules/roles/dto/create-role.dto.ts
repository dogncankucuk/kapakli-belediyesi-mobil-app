import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ResourcePermissionDto } from './resource-permission.dto';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourcePermissionDto)
  permissions: ResourcePermissionDto[];

  @IsOptional()
  @IsMongoId()
  departmanId?: string | null;
}
