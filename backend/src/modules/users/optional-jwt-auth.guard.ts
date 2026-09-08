import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';

export type OptionalAuthenticatedRequest = Request & {
  userId: string | null;
};

// JwtAuthGuard'in "misafir de olabilir" hali - auth guard'i olmayan public
// create endpoint'lerinde (POST /requests, /basvurular, /appointments)
// istemciden gelen ham userId'ye guvenmemek icin kullanilir: gecerli bir
// Bearer token varsa userId'yi token'dan doldurur, yoksa/gecersizse istegi
// reddetmeden userId'yi null birakir (bkz. JwtAuthGuard - ayni
// tokenVersion/disabled kontrolu burada da tekrarlaniyor).
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<OptionalAuthenticatedRequest>();
    request.userId = null;

    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;
    if (!token) {
      return true;
    }

    let payload: { sub: string; tv?: number };
    try {
      payload = this.jwtService.verify<{ sub: string; tv?: number }>(token);
    } catch {
      return true;
    }

    const user = await this.userModel.findById(payload.sub);
    if (!user || user.disabled || user.tokenVersion !== (payload.tv ?? 0)) {
      return true;
    }

    request.userId = payload.sub;
    return true;
  }
}
