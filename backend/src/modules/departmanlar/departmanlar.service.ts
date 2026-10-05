import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AdminUser, AdminUserDocument } from '../admin-users/schemas/admin-user.schema';
import {
  AdminRole,
  AdminRoleDocument,
  ResourcePermission,
} from '../roles/schemas/admin-role.schema';
import {
  MedyaKlasoru,
  MedyaKlasoruDocument,
} from '../medya/schemas/medya-klasoru.schema';
import { CreateDepartmanDto } from './dto/create-departman.dto';
import { Departman, DepartmanDocument } from './schemas/departman.schema';

export interface DepartmanView {
  id: string;
  ad: string;
  varsayilanYetkiler: ResourcePermission[];
  kullaniciSayisi: number;
  updatedBy: string | null;
  createdAt: string;
}

type TimestampedDepartman = DepartmanDocument & { createdAt: Date };

@Injectable()
export class DepartmanlarService {
  constructor(
    @InjectModel(Departman.name)
    private readonly departmanModel: Model<DepartmanDocument>,
    @InjectModel(AdminUser.name)
    private readonly adminUserModel: Model<AdminUserDocument>,
    @InjectModel(MedyaKlasoru.name)
    private readonly medyaKlasoruModel: Model<MedyaKlasoruDocument>,
    @InjectModel(AdminRole.name)
    private readonly roleModel: Model<AdminRoleDocument>,
  ) {}

  async findAll(): Promise<DepartmanView[]> {
    const departmanlar = await this.departmanModel.find().sort({ ad: 1 }).exec();
    const sayimlar = await this.adminUserModel.aggregate<{
      _id: Types.ObjectId;
      adet: number;
    }>([{ $group: { _id: '$departmanId', adet: { $sum: 1 } } }]);
    const sayimMap = new Map(
      sayimlar
        .filter((s) => s._id)
        .map((s) => [s._id.toString(), s.adet]),
    );

    return departmanlar.map((doc) => {
      const d = doc as unknown as TimestampedDepartman;
      return {
        id: d._id.toString(),
        ad: d.ad,
        varsayilanYetkiler: d.varsayilanYetkiler ?? [],
        kullaniciSayisi: sayimMap.get(d._id.toString()) ?? 0,
        updatedBy: d.updatedBy ?? null,
        createdAt: d.createdAt.toISOString(),
      };
    });
  }

  async create(
    dto: CreateDepartmanDto,
    updatedBy: string,
  ): Promise<DepartmanView> {
    const temizAd = dto.ad.trim();
    if (!temizAd) {
      throw new BadRequestException('Departman adı gerekli');
    }
    const mevcut = await this.departmanModel
      .exists({ ad: { $regex: `^${escapeRegex(temizAd)}$`, $options: 'i' } })
      .exec();
    if (mevcut) {
      throw new BadRequestException('Bu isimde bir departman zaten var');
    }
    const created = (await this.departmanModel.create({
      ad: temizAd,
      varsayilanYetkiler: dto.varsayilanYetkiler ?? [],
      updatedBy,
    })) as unknown as TimestampedDepartman;
    return {
      id: created._id.toString(),
      ad: created.ad,
      varsayilanYetkiler: created.varsayilanYetkiler ?? [],
      kullaniciSayisi: 0,
      updatedBy: created.updatedBy ?? null,
      createdAt: created.createdAt.toISOString(),
    };
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const kullaniciSayisi = await this.adminUserModel.countDocuments({
      departmanId: id,
    });
    if (kullaniciSayisi > 0) {
      throw new ConflictException(
        `Bu departmana atanmış ${kullaniciSayisi} kullanıcı var. Önce onları başka bir departmana taşıyın.`,
      );
    }

    const klasorSayisi = await this.medyaKlasoruModel.countDocuments({
      gorunurDepartmanlar: id,
    });
    if (klasorSayisi > 0) {
      throw new ConflictException(
        `Bu departman ${klasorSayisi} medya klasöründe görünürlük olarak kullanılıyor. Önce o klasörlerden kaldırın.`,
      );
    }

    const rolSayisi = await this.roleModel.countDocuments({ departmanId: id });
    if (rolSayisi > 0) {
      throw new ConflictException(
        `Bu departman ${rolSayisi} role atanmış. Önce o rollerden kaldırın.`,
      );
    }

    const res = await this.departmanModel.findByIdAndDelete(id).exec();
    return !!res;
  }
}

function escapeRegex(metin: string): string {
  return metin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
