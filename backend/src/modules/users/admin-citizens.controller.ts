import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { RbacGuard } from '../../admin/auth/rbac.guard';
import { RequirePermission } from '../../admin/auth/require-permission.decorator';
import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import {
  AdminCitizensService,
  AdminCitizenUser,
} from './admin-citizens.service';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

// Vatandas hesaplari (T.C. kimlik no, telefon vb. KVKK kapsaminda hassas
// kisisel veri) - RbacGuard bu kaynagi sadece Super Admin'e aciyor
// (bkz. admin/auth/rbac.guard.ts).
@Controller('admin-api/users')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminCitizensController {
  constructor(private readonly adminCitizensService: AdminCitizensService) {}

  @Get()
  @RequirePermission('users', 'list')
  findAll(@Query('search') search?: string): Promise<AdminCitizenUser[]> {
    return this.adminCitizensService.findAll(search);
  }

  @Get(':id')
  @RequirePermission('users', 'show')
  findOne(@Param('id') id: string): Promise<AdminCitizenUser> {
    return this.adminCitizensService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('users', 'edit')
  update(
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
  ): Promise<AdminCitizenUser> {
    return this.adminCitizensService.setDisabled(id, dto.disabled);
  }

  @Delete(':id')
  @RequirePermission('users', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    const removed = await this.adminCitizensService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
  }
}
