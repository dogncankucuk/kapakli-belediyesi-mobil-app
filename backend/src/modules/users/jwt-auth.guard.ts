import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';

export type AuthenticatedRequest = Request & { userId: string };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;

    if (!token) {
      throw new UnauthorizedException();
    }

    let payload: { sub: string; tv?: number };
    try {
      payload = this.jwtService.verify<{ sub: string; tv?: number }>(token);
    } catch {
      throw new UnauthorizedException();
    }

    // Imza gecerli olsa bile, hesap sonradan disable edilmis veya sifresi
    // degistirilmis (tokenVersion artmis) olabilir - DB'den taze durumu
    // kontrol ediyoruz. Bu, "logout"suz da bir token'i sunucu tarafinda
    // gecersiz kilabilmemizi sagliyor (bkz. admin-api/users disable islemi).
    const user = await this.userModel.findById(payload.sub);
    if (!user || user.disabled || user.tokenVersion !== (payload.tv ?? 0)) {
      throw new UnauthorizedException();
    }

    request.userId = payload.sub;
    return true;
  }
}
