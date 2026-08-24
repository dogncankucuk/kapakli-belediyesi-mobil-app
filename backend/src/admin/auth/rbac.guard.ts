import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { PermissionsService } from '../../modules/roles/permissions.service';
import {
  PERMISSION_KEY,
  RequiredPermission,
} from './require-permission.decorator';

// Yetkiler artik veritabaninda (bkz. modules/roles) - roller admin panelden
// dinamik olarak tanimlanip her kaynak (resource) icin ayri ayri
// list/show/create/edit/delete izni verilebiliyor. Eskiden burada
// CONTENT_MANAGER_RESOURCES / OPERATOR_EDIT_ONLY_RESOURCES adinda 2 sabit
// dizi + switch-case vardi, artik tum kontrol PermissionsService uzerinden.
@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<RequiredPermission | undefined>(
      PERMISSION_KEY,
      context.getHandler(),
    );
    if (!permission) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const adminUser = request.session?.adminUser;
    if (!adminUser) {
      throw new ForbiddenException();
    }

    const allowed = await this.permissionsService.hasPermission(
      adminUser.roleId,
      permission.resource,
      permission.action,
    );
    if (!allowed) {
      throw new ForbiddenException();
    }

    return true;
  }
}
