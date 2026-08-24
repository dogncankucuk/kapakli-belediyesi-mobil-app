import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AdminUser, AdminUserDocument } from '../admin-users/schemas/admin-user.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AdminRole, AdminRoleDocument } from './schemas/admin-role.schema';

export interface AdminRoleView {
  id: string;
  name: string;
  isFullAccess: boolean;
  isProtected: boolean;
  permissions: { resource: string; actions: string[] }[];
  userCount: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedRole = AdminRoleDocument & { createdAt: Date; updatedAt: Date };

@Injectable()
export class AdminRolesService {
  constructor(
    @InjectModel(AdminRole.name)
    private readonly roleModel: Model<AdminRoleDocument>,
    @InjectModel(AdminUser.name)
    private readonly adminUserModel: Model<AdminUserDocument>,
  ) {}

  async findAll(): Promise<AdminRoleView[]> {
    const roles = await this.roleModel.find().sort({ name: 1 }).exec();
    const counts = await this.adminUserModel.aggregate<{
      _id: Types.ObjectId;
      count: number;
    }>([{ $group: { _id: '$roleId', count: { $sum: 1 } } }]);
    const countByRoleId = new Map(
      counts.map((c) => [c._id.toString(), c.count]),
    );

    return roles.map((doc) =>
      this.toView(
        doc as unknown as TimestampedRole,
        countByRoleId.get(doc._id.toString()) ?? 0,
      ),
    );
  }

  async findOne(id: string): Promise<AdminRoleView | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.roleModel.findById(id).exec();
    if (!doc) return null;
    const userCount = await this.adminUserModel.countDocuments({
      roleId: doc._id,
    });
    return this.toView(doc as unknown as TimestampedRole, userCount);
  }

  async create(dto: CreateRoleDto, updatedBy: string): Promise<AdminRoleView> {
    const created = (await this.roleModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedRole;
    return this.toView(created, 0);
  }

  async update(
    id: string,
    dto: UpdateRoleDto,
    updatedBy: string,
  ): Promise<AdminRoleView | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const existing = await this.roleModel.findById(id).exec();
    if (!existing) return null;
    if (existing.isProtected) {
      throw new BadRequestException(
        'Bu rol sistem tarafından korunuyor, düzenlenemez.',
      );
    }

    const doc = await this.roleModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    if (!doc) return null;
    const userCount = await this.adminUserModel.countDocuments({
      roleId: doc._id,
    });
    return this.toView(doc as unknown as TimestampedRole, userCount);
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const existing = await this.roleModel.findById(id).exec();
    if (!existing) return false;
    if (existing.isProtected) {
      throw new BadRequestException(
        'Bu rol sistem tarafından korunuyor, silinemez.',
      );
    }
    const userCount = await this.adminUserModel.countDocuments({
      roleId: existing._id,
    });
    if (userCount > 0) {
      throw new ConflictException(
        `Bu role atanmış ${userCount} kullanıcı var. Önce onları başka bir role taşıyın.`,
      );
    }

    const res = await this.roleModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toView(doc: TimestampedRole, userCount: number): AdminRoleView {
    return {
      id: doc._id.toString(),
      name: doc.name,
      isFullAccess: doc.isFullAccess,
      isProtected: doc.isProtected,
      permissions: doc.permissions.map((p) => ({
        resource: p.resource,
        actions: p.actions,
      })),
      userCount,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
