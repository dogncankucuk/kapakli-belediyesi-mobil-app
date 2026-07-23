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

import { AuthService } from './auth.service';
import type { AdminSessionUser } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SessionAuthGuard } from './session-auth.guard';

@Controller('admin-api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<AdminSessionUser> {
    const adminUser = await this.authService.validateCredentials(dto);
    if (!adminUser) {
      throw new UnauthorizedException(
        'Geçersiz e-posta, şifre veya doğrulama kodu',
      );
    }

    req.session.adminUser = adminUser;
    return adminUser;
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
  me(@Req() req: Request): AdminSessionUser {
    return req.session.adminUser!;
  }
}
