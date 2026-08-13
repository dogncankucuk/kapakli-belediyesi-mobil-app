import { SetMetadata } from '@nestjs/common';

export type AdminResource =
  | 'announcements'
  | 'atikNoktalari'
  | 'appointments'
  | 'requests'
  | 'pharmacies'
  | 'meclisKararlari'
  | 'vefatEdenler'
  | 'wifiNoktalari'
  | 'ulasimHatlari'
  | 'suHizmetleri'
  | 'asevi'
  | 'camiler'
  | 'onemliKurumlar'
  | 'parklar'
  | 'tarihiYerler'
  | 'users';
export type AdminAction = 'list' | 'show' | 'create' | 'edit' | 'delete';

export interface RequiredPermission {
  resource: AdminResource;
  action: AdminAction;
}

export const PERMISSION_KEY = 'permission';

export const RequirePermission = (
  resource: AdminResource,
  action: AdminAction,
): ReturnType<typeof SetMetadata> =>
  SetMetadata(PERMISSION_KEY, {
    resource,
    action,
  } satisfies RequiredPermission);
