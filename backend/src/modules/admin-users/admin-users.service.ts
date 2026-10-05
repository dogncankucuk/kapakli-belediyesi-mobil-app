import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model, Types } from 'mongoose';

import {
  AdminRole,
  AdminRoleDocument,
  ResourcePermission,
} from '../roles/schemas/admin-role.schema';
import { Departman, DepartmanDocument } from '../departmanlar/schemas/departman.schema';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { AdminUser, AdminUserDocument } from './schemas/admin-user.schema';

export interface AdminUserView {
  id: string;
  email: string;
  ad: string | null;
  isFullAccess: boolean;
  permissions: ResourcePermission[];
  departmanId: string | null;
  departmanAdi: string | null;
  disabled: boolean;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedAdminUser = AdminUserDocument & {
  createdAt: Date;
  updatedAt: Date;
};

// Bu servis "her kullaniciya ozel yetki" modelini uygular: Roller sayfasi
// ayri/paylasilan bir liste olarak kalkti, her admin kullanicinin kendine
// ait, baskasiyla paylasilmayan bir AdminRole kaydi vardir (bkz.
// AdminUserView.permissions - dogrudan bu ozel rolden okunur). Tek istisna
// "Super Admin" (isFullAccess=true, isProtected=true) rolu: bu, sistemde
// TEK ve PAYLASILAN kalir (birden fazla kullanici ona baglanabilir),
// cunku kilitlenmeyi onleyen "en az bir aktif Super Admin" guvenlik
// kontrolu bunu varsayar.
@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(AdminUser.name)
    private readonly adminUserModel: Model<AdminUserDocument>,
    @InjectModel(AdminRole.name)
    private readonly roleModel: Model<AdminRoleDocument>,
    @InjectModel(Departman.name)
    private readonly departmanModel: Model<DepartmanDocument>,
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
    if (dto.departmanId) {
      const departman = await this.departmanModel.findById(dto.departmanId).exec();
      if (!departman) {
        throw new BadRequestException('Geçersiz departman.');
      }
    }

    const roleId = dto.isFullAccess
      ? await this.findProtectedFullAccessRoleId()
      : (
          await this.roleModel.create({
            name: `Kullanıcı: ${dto.email.trim().toLowerCase()}`,
            isFullAccess: false,
            isProtected: false,
            permissions: dto.permissions ?? [],
            updatedBy,
          })
        )._id;

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const created = (await this.adminUserModel.create({
      email: dto.email.trim().toLowerCase(),
      passwordHash,
      ad: dto.ad,
      roleId,
      departmanId: dto.departmanId ? new Types.ObjectId(dto.departmanId) : undefined,
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

    if (dto.departmanId) {
      const departman = await this.departmanModel.findById(dto.departmanId).exec();
      if (!departman) {
        throw new BadRequestException('Geçersiz departman.');
      }
    }

    const currentRole = await this.roleModel.findById(existing.roleId).exec();
    const currentlyFullAccess = currentRole?.isFullAccess ?? false;

    // Tam yetki kapatiliyorsa (ya da pasife aliniyorsa), ve bu kullanici su
    // anki tek aktif tam yetkili (Super Admin) kullaniciysa engelle - panel
    // kilitlenmesin.
    const willLoseFullAccess =
      (dto.disabled === true || dto.isFullAccess === false) &&
      currentlyFullAccess &&
      (await this.isLastActiveFullAccessUser(existing));
    if (willLoseFullAccess) {
      throw new ConflictException(
        'Sistemde en az bir aktif tam yetkili (Süper Admin) kullanıcı kalmalı.',
      );
    }

    let yeniRoleId: Types.ObjectId | null = null;
    const eskiRoleId = existing.roleId;

    if (dto.isFullAccess === true && !currentlyFullAccess) {
      yeniRoleId = await this.findProtectedFullAccessRoleId();
    } else if (dto.isFullAccess === false && currentlyFullAccess) {
      const yeniRol = await this.roleModel.create({
        name: `Kullanıcı: ${existing.email}`,
        isFullAccess: false,
        isProtected: false,
        permissions: dto.permissions ?? [],
        updatedBy: currentUserEmail,
      });
      yeniRoleId = yeniRol._id;
    } else if (dto.permissions !== undefined && !currentlyFullAccess) {
      // Rol baska kullanicilarla paylasiliyorsa (eski/ortak bir rol -
      // ornegin bu redesign'dan once olusturulmus) onlari etkilememek icin
      // bu kullaniciya ozel yeni bir rol olusturulur. Zaten kendine ozel
      // (paylasilmayan) bir roldeyse, dogrudan o rol guncellenir - her
      // duzenlemede gereksiz rol birikmesin diye.
      const paylasanBaskaKullaniciSayisi = await this.adminUserModel.countDocuments({
        roleId: eskiRoleId,
        _id: { $ne: existing._id },
      });
      if (paylasanBaskaKullaniciSayisi > 0) {
        const yeniRol = await this.roleModel.create({
          name: `Kullanıcı: ${existing.email}`,
          isFullAccess: false,
          isProtected: false,
          permissions: dto.permissions,
          updatedBy: currentUserEmail,
        });
        yeniRoleId = yeniRol._id;
      } else {
        await this.roleModel
          .findByIdAndUpdate(eskiRoleId, {
            permissions: dto.permissions,
            updatedBy: currentUserEmail,
          })
          .exec();
      }
    }

    const update: Record<string, unknown> = { updatedBy: currentUserEmail };
    const unset: Record<string, ''> = {};
    if (dto.ad !== undefined) update.ad = dto.ad;
    if (yeniRoleId) update.roleId = yeniRoleId;
    if (dto.departmanId !== undefined) {
      if (dto.departmanId === null) {
        unset.departmanId = '';
      } else {
        update.departmanId = new Types.ObjectId(dto.departmanId);
      }
    }
    if (dto.disabled !== undefined) update.disabled = dto.disabled;
    if (dto.password) update.passwordHash = await bcrypt.hash(dto.password, 12);

    const doc = await this.adminUserModel
      .findByIdAndUpdate(
        id,
        Object.keys(unset).length > 0 ? { $set: update, $unset: unset } : update,
        { new: true },
      )
      .exec();
    if (!doc) return null;

    if (yeniRoleId) {
      await this.rolOrfansaSil(eskiRoleId);
    }

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

    const roleId = existing.roleId;
    const res = await this.adminUserModel.findByIdAndDelete(id).exec();
    if (!res) return false;

    await this.rolOrfansaSil(roleId);
    return true;
  }

  private async findProtectedFullAccessRoleId(): Promise<Types.ObjectId> {
    const rol = await this.roleModel
      .findOne({ isFullAccess: true, isProtected: true })
      .exec();
    if (!rol) {
      throw new BadRequestException(
        'Sistemde korumalı Süper Admin rolü bulunamadı.',
      );
    }
    return rol._id;
  }

  // Bir kullaniciyi baska bir role tasidiktan/sildikten sonra, geride
  // kalan eski rolu - artik hic kimse tarafindan kullanilmiyorsa ve
  // korumali (paylasilan Super Admin gibi) degilse - temizler. Boylece her
  // duzenleme/silme "kullanici basina 1 ozel rol" kaydini artik
  // biriktirmeden korur.
  private async rolOrfansaSil(roleId: Types.ObjectId): Promise<void> {
    const rol = await this.roleModel.findById(roleId).exec();
    if (!rol || rol.isProtected) return;
    const kullaniciSayisi = await this.adminUserModel.countDocuments({ roleId });
    if (kullaniciSayisi === 0) {
      await this.roleModel.findByIdAndDelete(roleId).exec();
    }
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
    const roleById = new Map(roles.map((r) => [r._id.toString(), r]));

    const departmanIds = [
      ...new Set(
        docs.filter((d) => d.departmanId).map((d) => d.departmanId!.toString()),
      ),
    ];
    const departmanlar = departmanIds.length
      ? await this.departmanModel.find({ _id: { $in: departmanIds } }).exec()
      : [];
    const departmanAdiById = new Map(
      departmanlar.map((d) => [d._id.toString(), d.ad]),
    );

    return docs.map((doc) => {
      const rol = roleById.get(doc.roleId.toString());
      return {
        id: doc._id.toString(),
        email: doc.email,
        ad: doc.ad ?? null,
        isFullAccess: rol?.isFullAccess ?? false,
        permissions: (rol?.permissions ?? []).map((p) => ({
          resource: p.resource,
          actions: p.actions,
        })),
        departmanId: doc.departmanId?.toString() ?? null,
        departmanAdi: doc.departmanId
          ? (departmanAdiById.get(doc.departmanId.toString()) ?? '(silinmiş departman)')
          : null,
        disabled: doc.disabled,
        updatedBy: doc.updatedBy ?? null,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      };
    });
  }
}
