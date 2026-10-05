import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';

import { RbacGuard } from '../../admin/auth/rbac.guard';
import { RequirePermission } from '../../admin/auth/require-permission.decorator';
import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import { UPLOADS_DIR } from '../../uploads-dir';
import { PermissionsService } from '../roles/permissions.service';
import { AdminMedyaKlasorleriService } from './admin-medya-klasorleri.service';
import { AdminMedya, AdminMedyaService } from './admin-medya.service';

const MAX_DOSYA_BOYUTU = 10 * 1024 * 1024; // 10MB

const uploadStorage = diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, callback) => {
    callback(null, `${randomUUID()}${extname(file.originalname)}`);
  },
});

@Controller('admin-api/medya')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminMedyaController {
  constructor(
    private readonly adminMedyaService: AdminMedyaService,
    private readonly adminMedyaKlasorleriService: AdminMedyaKlasorleriService,
    private readonly permissionsService: PermissionsService,
  ) {}

  // Klasor listesinde gizli olsa bile id bilen birinin GET/POST ile
  // dogrudan icerigine erismesini engeller - bkz. AdminMedyaKlasorleriService
  // yorumundaki ayni mantik.
  private async klasoreErisimVarMi(
    klasorId: string | undefined,
    req: Request,
  ): Promise<boolean> {
    if (!klasorId || klasorId === 'root') return true;
    const { roleId, departmanId } = req.session.adminUser!;
    const rol = await this.permissionsService.getRoleSummary(roleId);
    return this.adminMedyaKlasorleriService.erisimVarMi(klasorId, {
      departmanId,
      isFullAccess: rol?.isFullAccess ?? false,
    });
  }

  @Get()
  @RequirePermission('medya', 'list')
  async findAll(
    @Query('klasorId') klasorId: string | undefined,
    @Req() req: Request,
  ): Promise<AdminMedya[]> {
    if (!(await this.klasoreErisimVarMi(klasorId, req))) {
      throw new ForbiddenException();
    }
    return this.adminMedyaService.findAll(klasorId);
  }

  @Post()
  @RequirePermission('medya', 'create')
  @UseInterceptors(
    FileInterceptor('dosya', {
      storage: uploadStorage,
      limits: { fileSize: MAX_DOSYA_BOYUTU },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body('klasorId') klasorId: string | undefined,
    @Req() req: Request,
  ): Promise<AdminMedya> {
    if (!file) {
      throw new BadRequestException('Dosya gerekli');
    }
    if (!(await this.klasoreErisimVarMi(klasorId, req))) {
      throw new ForbiddenException();
    }
    return this.adminMedyaService.create(
      file,
      klasorId,
      req.session.adminUser!.email,
    );
  }

  @Delete(':id')
  @RequirePermission('medya', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminMedyaService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
