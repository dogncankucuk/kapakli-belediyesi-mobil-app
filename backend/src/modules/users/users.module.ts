import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminCitizensController } from './admin-citizens.controller';
import { AdminCitizensService } from './admin-citizens.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SmsService } from './sms.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        // 30 gunden 7 gune dusuruldu: token calinirsa acik kalma suresini
        // kisaltir. Tam bir refresh-token akisi yok (kullanici 7 gunde bir
        // yeniden giris yapar) - bkz. hesap disable/tokenVersion mekanizmasi
        // (jwt-auth.guard.ts) sunucu tarafinda erken iptal icin.
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController, AdminCitizensController],
  providers: [UsersService, JwtAuthGuard, AdminCitizensService, SmsService],
  exports: [MongooseModule],
})
export class UsersModule {}
