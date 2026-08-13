import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { AdminRole } from '../../modules/admin-users/admin-role.enum';
import {
  AdminResource,
  PERMISSION_KEY,
  RequiredPermission,
} from './require-permission.decorator';

// architecture.md §9: "İçerik Yöneticisi: announcements, harita POI verileri
// üzerinde create/update/delete" - tum icerik/POI tipi kaynaklar bu grupta.
const CONTENT_MANAGER_RESOURCES: AdminResource[] = [
  'announcements',
  'atikNoktalari',
  'pharmacies',
  'meclisKararlari',
  'vefatEdenler',
  'wifiNoktalari',
  'ulasimHatlari',
  'suHizmetleri',
  'camiler',
  'onemliKurumlar',
  'parklar',
  'tarihiYerler',
];

// architecture.md §9: "Randevu/Talep Operatörü: appointments, requests
// üzerinde read/update - silme yetkisi yok".
const OPERATOR_EDIT_ONLY_RESOURCES: AdminResource[] = [
  'appointments',
  'requests',
  'asevi',
];

// architecture.md §9 rol tablosunun birebir karşılığı (eski admin.rbac.ts'ten taşındı)
function isActionAllowed(
  permission: RequiredPermission,
  role: AdminRole,
): boolean {
  if (role === AdminRole.SUPER_ADMIN) return true;

  // Vatandas hesaplari (T.C. kimlik no, telefon gibi KVKK kapsaminda hassas
  // kisisel veri icerir) - listeleme dahil sadece Super Admin erisebilir,
  // digerlerinde asagidaki genel list/show serbestligi gecerli degil.
  if (permission.resource === 'users') {
    return false;
  }

  if (permission.action === 'list' || permission.action === 'show') {
    return true;
  }

  if (CONTENT_MANAGER_RESOURCES.includes(permission.resource)) {
    return role === AdminRole.CONTENT_MANAGER;
  }

  return (
    OPERATOR_EDIT_ONLY_RESOURCES.includes(permission.resource) &&
    permission.action === 'edit' &&
    role === AdminRole.APPOINTMENT_OPERATOR
  );
}

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.get<RequiredPermission | undefined>(
      PERMISSION_KEY,
      context.getHandler(),
    );
    if (!permission) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const role = request.session?.adminUser?.role;
    if (!role || !isActionAllowed(permission, role)) {
      throw new ForbiddenException();
    }

    return true;
  }
}
