import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthenticatedRequest } from './jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Kayit spam'ini sinirlar: ayni IP'den 10 dakikada en fazla 5 kayit denemesi.
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.usersService.register(dto);
  }

  // Brute-force sifre denemesini sinirlar: ayni IP'den 10 dakikada en fazla
  // 10 giris denemesi (yanlis sifre yazan gercek bir kullaniciyi engellemeyecek
  // kadar gevsek, otomatik deneme saldirisini pratik olarak imkansizlastiracak
  // kadar siki).
  @Throttle({ default: { limit: 10, ttl: 600_000 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  @Throttle({ default: { limit: 20, ttl: 600_000 } })
  @Post('google')
  loginWithGoogle(@Body() dto: GoogleLoginDto) {
    return this.usersService.loginWithGoogle(dto.idToken);
  }

  // SMS spam'ini sinirlar: ayni IP'den 10 dakikada en fazla 5 kod istegi.
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.usersService.forgotPassword(dto);
  }

  // Kod tahmin etmeyi (brute-force) sinirlar - servis tarafinda ayrica
  // hesap basina 5 yanlis denemeden sonra da kilitleniyor (bkz. users.service.ts).
  @Throttle({ default: { limit: 10, ttl: 600_000 } })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() request: AuthenticatedRequest) {
    return this.usersService.findById(request.userId);
  }
}
