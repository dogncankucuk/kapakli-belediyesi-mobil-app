import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model, Types } from 'mongoose';

import { AdminRole, AdminRoleDocument } from '../roles/schemas/admin-role.schema';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { AdminUser, AdminUserDocument } from './schemas/admin-user.schema';

export interface AdminUserView {
  id: string;
  email: string;
  ad: string | null;
  roleId: string;
  roleName: string;
  disabled: boolean;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedAdminUser = AdminUserDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(AdminUser.name)
    private readonly adminUserModel: Model<AdminUserDocument>,
    @InjectModel(AdminRole.name)
    private readonly roleModel: Model<AdminRoleDocument>,
  ) {}

  async findAll(): Promise<AdminUserView[]> {
    const users = await this.adminUserModel.find().sort({ email: 1 }).exec();
    return this.toViews(users as unknown as TimestampedAdminUser[]);
  }

  async findOne(id: string): Promise<AdminUserView | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.adminUserModel.findById(id).exec();
    if (!doc) return null;
    const [view] = await this.toViews([doc as unknown as TimestampedAdminUser]);
    return view;
  }

  async create(
    dto: CreateAdminUserDto,
    updatedBy: string,
  ): Promise<AdminUserView> {
    const role = await this.roleModel.findById(dto.roleId).exec();
    if (!role) {
      throw new BadRequestException('Geçersiz rol.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const created = (await this.adminUserModel.create({
      email: dto.email.trim().toLowerCase(),
      passwordHash,
      ad: dto.ad,
      roleId: new Types.ObjectId(dto.roleId),
      updatedBy,
    })) as unknown as TimestampedAdminUser;

    const [view] = await this.toViews([created]);
    return view;
  }

  async update(
    id: string,
    dto: UpdateAdminUserDto,
    currentUserEmail: string,
  ): Promise<AdminUserView | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const existing = await this.adminUserModel.findById(id).exec();
    if (!existing) return null;

    const isSelf = existing.email === currentUserEmail.trim().toLowerCase();

    if (dto.disabled === true && isSelf) {
      throw new BadRequestException('Kendi hesabınızı pasife alamazsınız.');
    }

    if (dto.roleId) {
      const newRole = await this.roleModel.findById(dto.roleId).exec();
      if (!newRole) {
        throw new BadRequestException('Geçersiz rol.');
      }
    }

    // Rol degisiyor veya pasife aliniyorsa, ve bu kullanici su anki tam
    // yetkili (isFullAccess) tek aktif kullaniciysa engelle - panel
    // kilitlenmesin.
    const willLoseFullAccess =
      (dto.disabled === true || (dto.roleId && dto.roleId !== existing.roleId.toString())) &&
      (await this.isLastActiveFullAccessUser(existing));
    if (willLoseFullAccess) {
      throw new ConflictException(
        'Sistemde en az bir aktif tam yetkili (Süper Admin) kullanıcı kalmalı.',
      );
    }

    const update: Record<string, unknown> = { updatedBy: currentUserEmail };
    if (dto.ad !== undefined) update.ad = dto.ad;
    if (dto.roleId !== undefined) update.roleId = new Types.ObjectId(dto.roleId);
    if (dto.disabled !== undefined) update.disabled = dto.disabled;
    if (dto.password) update.passwordHash = await bcrypt.hash(dto.password, 12);

    const doc = await this.adminUserModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!doc) return null;
    const [view] = await this.toViews([doc as unknown as TimestampedAdminUser]);
    return view;
  }

  async remove(id: string, currentUserEmail: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const existing = await this.adminUserModel.findById(id).exec();
    if (!existing) return false;

    if (existing.email === currentUserEmail.trim().toLowerCase()) {
      throw new BadRequestException('Kendi hesabınızı silemezsiniz.');
    }

    if (await this.isLastActiveFullAccessUser(existing)) {
      throw new ConflictException(
        'Sistemde en az bir aktif tam yetkili (Süper Admin) kullanıcı kalmalı.',
      );
    }

    const res = await this.adminUserModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private async isLastActiveFullAccessUser(
    user: AdminUserDocument,
  ): Promise<boolean> {
    if (user.disabled) return false;
    const role = await this.roleModel.findById(user.roleId).exec();
    if (!role || !role.isFullAccess) return false;

    const fullAccessRoleIds = await this.roleModel
      .find({ isFullAccess: true })
      .distinct('_id')
      .exec();
    const activeCount = await this.adminUserModel.countDocuments({
      roleId: { $in: fullAccessRoleIds },
      disabled: { $ne: true },
    });
    return activeCount <= 1;
  }

  private async toViews(
    docs: TimestampedAdminUser[],
  ): Promise<AdminUserView[]> {
    if (docs.length === 0) return [];
    const roleIds = [...new Set(docs.map((d) => d.roleId.toString()))];
    const roles = await this.roleModel
      .find({ _id: { $in: roleIds } })
      .exec();
    const roleNameById = new Map(
      roles.map((r) => [r._id.toString(), r.name]),
    );

    return docs.map((doc) => ({
      id: doc._id.toString(),
      email: doc.email,
      ad: doc.ad ?? null,
      roleId: doc.roleId.toString(),
      roleName: roleNameById.get(doc.roleId.toString()) ?? '(silinmiş rol)',
      disabled: doc.disabled,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    }));
  }
}
