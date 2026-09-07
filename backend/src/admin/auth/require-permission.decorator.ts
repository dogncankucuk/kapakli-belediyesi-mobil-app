import { SetMetadata } from '@nestjs/common';

export type AdminResource =
  | 'announcements'
  | 'haberler'
  | 'ilanlar'
  | 'ihaleler'
  | 'makaleler'
  | 'meclisGundemleri'
  | 'baskan'
  | 'hakkimizda'
  | 'bizeUlasin'
  | 'yardimMerkezi'
  | 'faturaOdeme'
  | 'ulasimHizmetleri'
  | 'temaAyarlari'
  | 'panelTemasi'
  | 'medya'
  | 'atikNoktalari'
  | 'appointments'
  | 'requests'
  | 'pharmacies'
  | 'meclisKararlari'
  | 'vefatEdenler'
  | 'wifiNoktalari'
  | 'ulasimHatlari'
  | 'atikRehberi'
  | 'suHizmetleri'
  | 'kaziCalismalari'
  | 'elektrikKesintileri'
  | 'asevi'
  | 'camiler'
  | 'onemliKurumlar'
  | 'parklar'
  | 'tarihiYerler'
  | 'formlar'
  | 'basvuruHizmetleri'
  | 'basvuruTurleri'
  | 'basvurular'
  | 'users'
  | 'roles'
  | 'adminUsers'
  | 'notifications';

// Admin panelin izin matrisi UI'inda kullanilan tam kaynak listesi -
// PermissionsService.getPermissionMap ve migrasyon script'i de bunu kullanir.
export const ALL_ADMIN_RESOURCES: AdminResource[] = [
  'announcements',
  'haberler',
  'ilanlar',
  'ihaleler',
  'makaleler',
  'meclisGundemleri',
  'baskan',
  'hakkimizda',
  'bizeUlasin',
  'yardimMerkezi',
  'faturaOdeme',
  'ulasimHizmetleri',
  'temaAyarlari',
  'panelTemasi',
  'medya',
  'atikNoktalari',
  'appointments',
  'requests',
  'pharmacies',
  'meclisKararlari',
  'vefatEdenler',
  'wifiNoktalari',
  'ulasimHatlari',
  'atikRehberi',
  'suHizmetleri',
  'kaziCalismalari',
  'elektrikKesintileri',
  'asevi',
  'camiler',
  'onemliKurumlar',
  'parklar',
  'tarihiYerler',
  'formlar',
  'basvuruHizmetleri',
  'basvuruTurleri',
  'basvurular',
  'users',
  'roles',
  'adminUsers',
  'notifications',
];
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
