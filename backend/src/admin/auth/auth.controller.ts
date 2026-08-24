import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { ALL_ADMIN_RESOURCES } from './require-permission.decorator';
import { PermissionsService } from '../../modules/roles/permissions.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SessionAuthGuard } from './session-auth.guard';

export interface AdminSessionInfo {
  email: string;
  role: { id: string; name: string; isFullAccess: boolean };
  permissions: Record<string, ('list' | 'manage')[]>;
}

@Controller('admin-api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<AdminSessionInfo> {
    const adminUser = await this.authService.validateCredentials(dto);
    if (!adminUser) {
      throw new UnauthorizedException(
        'Geçersiz e-posta, şifre veya doğrulama kodu',
      );
    }

    req.session.adminUser = adminUser;
    return this.buildSessionInfo(adminUser);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Req() req: Request): Promise<{ success: true }> {
    return new Promise((resolve) => {
      req.session.destroy(() => resolve({ success: true }));
    });
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  me(@Req() req: Request): Promise<AdminSessionInfo> {
    return this.buildSessionInfo(req.session.adminUser!);
  }

  private async buildSessionInfo(adminUser: {
    email: string;
    roleId: string;
  }): Promise<AdminSessionInfo> {
    const [roleSummary, permissions] = await Promise.all([
      this.permissionsService.getRoleSummary(adminUser.roleId),
      this.permissionsService.getPermissionMap(
        adminUser.roleId,
        ALL_ADMIN_RESOURCES,
      ),
    ]);

    return {
      email: adminUser.email,
      role: roleSummary ?? { id: adminUser.roleId, name: '(silinmiş rol)', isFullAccess: false },
      permissions,
    };
  }
}
