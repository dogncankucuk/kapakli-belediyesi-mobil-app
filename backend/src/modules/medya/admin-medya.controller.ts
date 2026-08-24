import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
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
  constructor(private readonly adminMedyaService: AdminMedyaService) {}

  @Get()
  @RequirePermission('medya', 'list')
  findAll(): Promise<AdminMedya[]> {
    return this.adminMedyaService.findAll();
  }

  @Post()
  @RequirePermission('medya', 'create')
  @UseInterceptors(
    FileInterceptor('dosya', {
      storage: uploadStorage,
      limits: { fileSize: MAX_DOSYA_BOYUTU },
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<AdminMedya> {
    if (!file) {
      throw new BadRequestException('Dosya gerekli');
    }
    return this.adminMedyaService.create(file, req.session.adminUser!.email);
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
