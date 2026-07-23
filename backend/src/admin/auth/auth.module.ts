import { Module } from '@nestjs/common';

import { AdminUsersModule } from '../../modules/admin-users/admin-users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [AdminUsersModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
