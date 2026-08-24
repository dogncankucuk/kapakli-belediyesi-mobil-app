import { ArrayUnique, IsIn, IsNotEmpty, IsString } from 'class-validator';

import { PermissionAction } from '../schemas/admin-role.schema';

const VALID_ACTIONS: PermissionAction[] = [
  'list',
  'show',
  'create',
  'edit',
  'delete',
];

export class ResourcePermissionDto {
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ArrayUnique()
  @IsIn(VALID_ACTIONS, { each: true })
  actions: PermissionAction[];
}
