import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { verify as verifyTotp } from 'otplib';

import { AdminRole } from '../../modules/admin-users/admin-role.enum';
import {
  AdminUser,
  AdminUserDocument,
} from '../../modules/admin-users/schemas/admin-user.schema';
import { LoginDto } from './dto/login.dto';

export interface AdminSessionUser {
  email: string;
  role: AdminRole;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(AdminUser.name)
    private readonly adminUserModel: Model<AdminUserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async validateCredentials(dto: LoginDto): Promise<AdminSessionUser | null> {
    const email = dto.email.trim().toLowerCase();

    const adminUser = await this.adminUserModel.findOne({ email }).exec();
    if (!adminUser) {
      return null;
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      adminUser.passwordHash,
    );
    if (!passwordValid) {
      return null;
    }

    // Gecici olarak devre disi birakilabilir (ADMIN_REQUIRE_TOTP=false) -
    // Gurkan'in istegiyle, authenticator kurulana kadar sadece e-posta+sifre
    // yeterli. Env ayarlanmazsa (production dahil) varsayilan GUVENLI
    // taraf: TOTP zorunlu. Geri acmak icin .env'den bu satiri kaldirmak/true
    // yapmak yeterli, kod tarafinda baska hicbir degisiklik gerekmiyor.
    const totpRequired =
      this.configService.get<string>('ADMIN_REQUIRE_TOTP') !== 'false';

    if (totpRequired) {
      if (!adminUser.totpEnabled || !adminUser.totpSecret) {
        return null;
      }
      const totpResult = await verifyTotp({
        secret: adminUser.totpSecret,
        token: (dto.totpToken ?? '').trim(),
      });
      if (!totpResult.valid) {
        return null;
      }
    }

    return { email: adminUser.email, role: adminUser.role };
  }
}
