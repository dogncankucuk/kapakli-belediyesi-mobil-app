import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminRole, AdminRoleSchema } from './schemas/admin-role.schema';
import { AdminRolesController } from './admin-roles.controller';
import { AdminRolesService } from './admin-roles.service';
import { PermissionsService } from './permissions.service';

// @Global: RbacGuard, hangi feature modulunun controller'inda kullanilirsa
// kullanilsin (formlar, camiler, pharmacies, ...) PermissionsService'i
// enjekte edebilmeli - bu ~20 modulun her birine RolesModule'u ayrica
// import ettirmemek icin global yapiliyor (tek yerde, app.module.ts'de
// import edilmesi yeterli). AdminRolesService'in ihtiyac duydugu AdminUser
// modeli, AdminUsersModule da @Global oldugu icin ayrica import edilmeden
// kullanilabiliyor (bkz. admin-users.module.ts).
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminRole.name, schema: AdminRoleSchema },
    ]),
  ],
  controllers: [AdminRolesController],
  providers: [AdminRolesService, PermissionsService],
  exports: [MongooseModule, PermissionsService],
})
export class RolesModule {}
