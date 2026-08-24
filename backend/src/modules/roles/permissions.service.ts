import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  AdminRole,
  AdminRoleDocument,
  PermissionAction,
} from './schemas/admin-role.schema';

export interface RoleSummary {
  id: string;
  name: string;
  isFullAccess: boolean;
}

// RbacGuard'in her istekte kullandigi, hafif ve hizli yetki kontrol servisi.
// RolesModule @Global oldugu icin herhangi bir feature modulune (formlar,
// camiler, vb.) elle import edilmeden her yerde enjekte edilebilir.
@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(AdminRole.name)
    private readonly roleModel: Model<AdminRoleDocument>,
  ) {}

  async hasPermission(
    roleId: string,
    resource: string,
    action: PermissionAction,
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(roleId)) return false;
    const role = await this.roleModel.findById(roleId).exec();
    if (!role) return false;
    if (role.isFullAccess) return true;

    const grant = role.permissions.find((p) => p.resource === resource);
    return grant ? grant.actions.includes(action) : false;
  }

  async getRoleSummary(roleId: string): Promise<RoleSummary | null> {
    if (!Types.ObjectId.isValid(roleId)) return null;
    const role = await this.roleModel.findById(roleId).exec();
    if (!role) return null;
    return { id: role._id.toString(), name: role.name, isFullAccess: role.isFullAccess };
  }

  // "Görüntüle"/"Yönet" seklinde 2 seviyeye indirgenmis, admin panelin
  // sidebar/canManage mantigini beslemek icin kullandigi tam yetki
  // haritasi. isFullAccess ise tum kaynaklar icin ["list","manage"] doner.
  async getPermissionMap(
    roleId: string,
    allResources: string[],
  ): Promise<Record<string, ('list' | 'manage')[]>> {
    if (!Types.ObjectId.isValid(roleId)) return {};
    const role = await this.roleModel.findById(roleId).exec();
    if (!role) return {};

    const map: Record<string, ('list' | 'manage')[]> = {};
    for (const resource of allResources) {
      if (role.isFullAccess) {
        map[resource] = ['list', 'manage'];
        continue;
      }
      const grant = role.permissions.find((p) => p.resource === resource);
      if (!grant) continue;
      const levels: ('list' | 'manage')[] = [];
      if (grant.actions.includes('list') || grant.actions.includes('show')) {
        levels.push('list');
      }
      if (
        grant.actions.includes('create') ||
        grant.actions.includes('edit') ||
        grant.actions.includes('delete')
      ) {
        levels.push('manage');
      }
      if (levels.length > 0) map[resource] = levels;
    }
    return map;
  }
}
