import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AdminUser, AdminUserDocument } from '../admin-users/schemas/admin-user.schema';
import { Departman, DepartmanDocument } from '../departmanlar/schemas/departman.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AdminRole, AdminRoleDocument } from './schemas/admin-role.schema';

export interface AdminRoleView {
  id: string;
  name: string;
  isFullAccess: boolean;
  isProtected: boolean;
  permissions: { resource: string; actions: string[] }[];
  departmanId: string | null;
  departmanAdi: string | null;
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
    @InjectModel(Departman.name)
    private readonly departmanModel: Model<DepartmanDocument>,
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
    const departmanAdiById = await this.departmanAdiMapiOlustur(roles);

    return roles.map((doc) =>
      this.toView(
        doc as unknown as TimestampedRole,
        countByRoleId.get(doc._id.toString()) ?? 0,
        departmanAdiById,
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
    const departmanAdiById = await this.departmanAdiMapiOlustur([doc]);
    return this.toView(doc as unknown as TimestampedRole, userCount, departmanAdiById);
  }

  async create(dto: CreateRoleDto, updatedBy: string): Promise<AdminRoleView> {
    if (dto.departmanId) {
      await this.departmaniDogrula(dto.departmanId);
    }
    const created = (await this.roleModel.create({
      ...dto,
      departmanId: dto.departmanId ?? undefined,
      updatedBy,
    })) as unknown as TimestampedRole;
    const departmanAdiById = await this.departmanAdiMapiOlustur([created]);
    return this.toView(created, 0, departmanAdiById);
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
    if (dto.departmanId) {
      await this.departmaniDogrula(dto.departmanId);
    }

    const doc = await this.roleModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    if (!doc) return null;
    const userCount = await this.adminUserModel.countDocuments({
      roleId: doc._id,
    });
    const departmanAdiById = await this.departmanAdiMapiOlustur([doc]);
    return this.toView(doc as unknown as TimestampedRole, userCount, departmanAdiById);
  }

  private async departmaniDogrula(departmanId: string): Promise<void> {
    const departman = await this.departmanModel.findById(departmanId).exec();
    if (!departman) {
      throw new BadRequestException('Geçersiz departman.');
    }
  }

  private async departmanAdiMapiOlustur(
    roles: AdminRoleDocument[],
  ): Promise<Map<string, string>> {
    const departmanIds = [
      ...new Set(
        roles.filter((r) => r.departmanId).map((r) => r.departmanId!.toString()),
      ),
    ];
    if (departmanIds.length === 0) return new Map();
    const departmanlar = await this.departmanModel
      .find({ _id: { $in: departmanIds } })
      .exec();
    return new Map(departmanlar.map((d) => [d._id.toString(), d.ad]));
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

  private toView(
    doc: TimestampedRole,
    userCount: number,
    departmanAdiById: Map<string, string>,
  ): AdminRoleView {
    const departmanId = doc.departmanId?.toString() ?? null;
    return {
      id: doc._id.toString(),
      name: doc.name,
      isFullAccess: doc.isFullAccess,
      isProtected: doc.isProtected,
      permissions: doc.permissions.map((p) => ({
        resource: p.resource,
        actions: p.actions,
      })),
      departmanId,
      departmanAdi: departmanId
        ? (departmanAdiById.get(departmanId) ?? '(silinmiş departman)')
        : null,
      userCount,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
