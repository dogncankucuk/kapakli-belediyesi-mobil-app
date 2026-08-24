import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { RolesModule } from '../modules/roles/roles.module';
import {
  AdminRole,
  AdminRoleDocument,
  PermissionAction,
} from '../modules/roles/schemas/admin-role.schema';
import { AdminUsersModule } from '../modules/admin-users/admin-users.module';
import {
  AdminUser,
  AdminUserDocument,
} from '../modules/admin-users/schemas/admin-user.schema';
import { ALL_ADMIN_RESOURCES } from '../admin/auth/require-permission.decorator';
// RolesModule/AdminUsersModule'un controller'lari req.session.adminUser
// kullaniyor - bu ambient module augmentation'i ts-node'un bu script icin
// olusturdugu programa dahil etmek icin side-effect import gerekiyor.
import '../admin/auth/session.types';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    RolesModule,
    AdminUsersModule,
  ],
})
class MigrationModule {}

// Eski sabit CONTENT_MANAGER_RESOURCES / OPERATOR_EDIT_ONLY_RESOURCES
// dizilerinin (rbac.guard.ts'in eski hali) birebir kopyasi - sadece bu
// migrasyonun davranisi dogru yansitmasi icin burada tutuluyor.
const OLD_CONTENT_MANAGER_RESOURCES = [
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
  'formlar',
  'basvuruHizmetleri',
];
const OLD_OPERATOR_RESOURCES = ['appointments', 'requests', 'asevi'];
const SENSITIVE_RESOURCES = ['users', 'roles', 'adminUsers'];
const NON_SENSITIVE_RESOURCES = ALL_ADMIN_RESOURCES.filter(
  (r) => !SENSITIVE_RESOURCES.includes(r),
);

const MANAGE_ACTIONS: PermissionAction[] = [
  'list',
  'show',
  'create',
  'edit',
  'delete',
];
const VIEW_ACTIONS: PermissionAction[] = ['list', 'show'];
const VIEW_EDIT_ACTIONS: PermissionAction[] = ['list', 'show', 'edit'];

function buildPermissions(
  manageResources: string[],
  editOnlyResources: string[] = [],
): { resource: string; actions: PermissionAction[] }[] {
  return NON_SENSITIVE_RESOURCES.map((resource) => {
    if (manageResources.includes(resource)) {
      return { resource, actions: MANAGE_ACTIONS };
    }
    if (editOnlyResources.includes(resource)) {
      return { resource, actions: VIEW_EDIT_ACTIONS };
    }
    return { resource, actions: VIEW_ACTIONS };
  });
}

async function migrate() {
  const app = await NestFactory.createApplicationContext(MigrationModule);

  try {
    const roleModel = app.get<Model<AdminRoleDocument>>(
      getModelToken(AdminRole.name),
    );
    const adminUserModel = app.get<Model<AdminUserDocument>>(
      getModelToken(AdminUser.name),
    );

    const rolesToSeed: {
      name: string;
      isFullAccess: boolean;
      isProtected: boolean;
      permissions: { resource: string; actions: PermissionAction[] }[];
    }[] = [
      {
        name: 'Süper Admin',
        isFullAccess: true,
        isProtected: true,
        permissions: [],
      },
      {
        name: 'İçerik Yöneticisi',
        isFullAccess: false,
        isProtected: false,
        permissions: buildPermissions(OLD_CONTENT_MANAGER_RESOURCES),
      },
      {
        name: 'Randevu/Talep Operatörü',
        isFullAccess: false,
        isProtected: false,
        permissions: buildPermissions([], OLD_OPERATOR_RESOURCES),
      },
      {
        name: 'Salt Okunur Denetçi',
        isFullAccess: false,
        isProtected: false,
        permissions: buildPermissions([]),
      },
    ];

    const roleIdByName = new Map<string, string>();
    for (const roleDef of rolesToSeed) {
      const existing = await roleModel.findOne({ name: roleDef.name }).exec();
      if (existing) {
        console.log(`Rol '${roleDef.name}' zaten mevcut, atlanıyor.`);
        roleIdByName.set(roleDef.name, existing._id.toString());
        continue;
      }
      const created = await roleModel.create(roleDef);
      console.log(`Rol oluşturuldu: '${roleDef.name}'`);
      roleIdByName.set(roleDef.name, created._id.toString());
    }

    const superAdminRoleId = roleIdByName.get('Süper Admin')!;

    // ONEMLI: AdminUser semasi artik `role` alanini tanimiyor - Mongoose
    // hem .find() sonucunda bu alani hydrate edilen dokumana koymuyor hem
    // de updateOne()'da $unset:{role:''} gibi sema-disi path'leri sessizce
    // yok sayiyor. Bu yuzden eski `role` alanini okuyup temizlemek icin
    // Mongoose modelini degil, ham MongoDB collection API'sini kullaniyoruz.
    const rawCollection = adminUserModel.collection;
    const legacyUsers = await rawCollection
      .find({ role: { $exists: true }, roleId: { $exists: false } })
      .toArray();

    for (const user of legacyUsers) {
      const legacyRole = user.role as string | undefined;
      const targetRoleId =
        legacyRole === 'superAdmin'
          ? superAdminRoleId
          : legacyRole === 'contentManager'
            ? roleIdByName.get('İçerik Yöneticisi')!
            : legacyRole === 'appointmentOperator'
              ? roleIdByName.get('Randevu/Talep Operatörü')!
              : roleIdByName.get('Salt Okunur Denetçi')!;

      await rawCollection.updateOne(
        { _id: user._id },
        { $set: { roleId: targetRoleId }, $unset: { role: '' } },
      );
      console.log(
        `Kullanıcı '${user.email}' -> roleId ayarlandı (eski rol: ${legacyRole}).`,
      );
    }

    if (legacyUsers.length === 0) {
      console.log('Eski `role` alanına sahip kullanıcı bulunamadı.');
    }

    console.log('\nMigrasyon tamamlandı.');
  } finally {
    await app.close();
  }
}

migrate().catch((error) => {
  console.error('Migrasyon başarısız:', error);
  process.exit(1);
});
