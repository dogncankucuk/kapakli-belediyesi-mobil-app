import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../users/jwt-auth.guard';
import type { AuthenticatedRequest } from '../users/jwt-auth.guard';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { NotificationsService } from './notifications.service';

@Controller('push-tokens')
@UseGuards(JwtAuthGuard)
export class PushTokensController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  register(
    @Body() dto: RegisterPushTokenDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    return this.notificationsService.registerPushToken(
      request.userId,
      dto.token,
      dto.platform,
    );
  }

  @Delete()
  remove(
    @Body('token') token: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    return this.notificationsService.removePushToken(request.userId, token);
  }
}
