import { Injectable } from '@nestjs/common';
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
  ) {}

  async validateCredentials(dto: LoginDto): Promise<AdminSessionUser | null> {
    const email = dto.email.trim().toLowerCase();

    const adminUser = await this.adminUserModel.findOne({ email }).exec();
    if (!adminUser || !adminUser.totpEnabled || !adminUser.totpSecret) {
      return null;
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      adminUser.passwordHash,
    );
    if (!passwordValid) {
      return null;
    }

    const totpResult = await verifyTotp({
      secret: adminUser.totpSecret,
      token: dto.totpToken.trim(),
    });
    if (!totpResult.valid) {
      return null;
    }

    return { email: adminUser.email, role: adminUser.role };
  }
}
