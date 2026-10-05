import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { RbacGuard } from '../../admin/auth/rbac.guard';
import { RequirePermission } from '../../admin/auth/require-permission.decorator';
import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import { CreateDepartmanDto } from './dto/create-departman.dto';
import { DepartmanlarService, DepartmanView } from './departmanlar.service';

// Departmanlar artik "Yonetici Kullanicilar" sayfasinin (Roller bu sayfayla
// birlesti) bir parcasi olarak, ayni yetkiyle ('adminUsers') yonetilir.
// Listeleme (GET) ise bilerek RequirePermission almiyor: yonetici kullanici
// atamasi ve medya klasoru gorunurlugu (MedyaKlasorListesi) gibi
// 'adminUsers' izni olmayan baska baglamlarda da departman secimi
// yapilabilmesi gerekiyor - departman adlari hassas veri degil, herhangi
// bir oturum acmis admin gorebilir.
@Controller('admin-api/departmanlar')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminDepartmanlarController {
  constructor(private readonly departmanlarService: DepartmanlarService) {}

  @Get()
  findAll(): Promise<DepartmanView[]> {
    return this.departmanlarService.findAll();
  }

  @Post()
  @RequirePermission('adminUsers', 'create')
  create(
    @Body() dto: CreateDepartmanDto,
    @Req() req: Request,
  ): Promise<DepartmanView> {
    return this.departmanlarService.create(dto, req.session.adminUser!.email);
  }

  @Delete(':id')
  @RequirePermission('adminUsers', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.departmanlarService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
