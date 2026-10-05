import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

import { PermissionsService } from '../../modules/roles/permissions.service';

// RbacGuard'daki kaynak bazli (resource/action) yetkilendirmeden farkli
// olarak burada hicbir role atanamayan sabit bir kontrol var: sadece
// isFullAccess=true olan rol (sistemin tek Super Admin'i) gecebilir.
// Kesinti API adresleri gibi hicbir rol'e devredilmemesi gereken alanlar
// icin kullanilir - Roller ekranindan bu izin baska bir role verilemez.
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly permissionsService: PermissionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const adminUser = request.session?.adminUser;
    if (!adminUser) {
      throw new ForbiddenException();
    }

    const role = await this.permissionsService.getRoleSummary(adminUser.roleId);
    if (!role?.isFullAccess) {
      throw new ForbiddenException();
    }

    return true;
  }
}
