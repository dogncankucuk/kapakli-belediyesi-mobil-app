import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminUser, AdminUserSchema } from './schemas/admin-user.schema';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';

// @Global: auth.service.ts (login sirasinda) ve roles modulu (rol silme
// oncesi kullanici sayimi icin) AdminUser modeline erisiyor - RolesModule
// ile ayni gerekce (bkz. roles.module.ts).
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminUser.name, schema: AdminUserSchema },
    ]),
  ],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
  exports: [MongooseModule],
})
export class AdminUsersModule {}
