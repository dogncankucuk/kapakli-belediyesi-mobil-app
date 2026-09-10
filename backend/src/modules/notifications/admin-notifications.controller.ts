import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { RbacGuard } from '../../admin/auth/rbac.guard';
import { RequirePermission } from '../../admin/auth/require-permission.decorator';
import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import { SendManualNotificationDto } from './dto/send-manual-notification.dto';
import { NotificationsService } from './notifications.service';

@Controller('admin-api/notifications')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @RequirePermission('notifications', 'create')
  async send(
    @Body() dto: SendManualNotificationDto,
  ): Promise<{ success: true }> {
    await this.notificationsService.sendBroadcastToAll(
      dto.baslik,
      dto.govde,
      dto.fotografUrl,
    );
    return { success: true };
  }
}
