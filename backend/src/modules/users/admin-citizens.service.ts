import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';

export interface AdminCitizenUser {
  id: string;
  ad: string;
  soyad: string;
  tcKimlikNo: string | null;
  telefon: string | null;
  eposta: string | null;
  googleHesabi: boolean;
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
}

type TimestampedUser = UserDocument & { createdAt: Date; updatedAt: Date };

// Aranan metindeki regex ozel karakterlerini kacirir - kullanici girdisini
// dogrudan RegExp'e vermek hem ReDoS hem de beklenmeyen desen eslesmesi
// riski tasir.
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const MAX_RESULTS = 500;

@Injectable()
export class AdminCitizensService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll(search?: string): Promise<AdminCitizenUser[]> {
    const filter = search?.trim()
      ? {
          $or: [
            { ad: { $regex: escapeRegex(search.trim()), $options: 'i' } },
            { soyad: { $regex: escapeRegex(search.trim()), $options: 'i' } },
            { telefon: { $regex: escapeRegex(search.trim()) } },
            { eposta: { $regex: escapeRegex(search.trim()), $options: 'i' } },
            { tcKimlikNo: { $regex: escapeRegex(search.trim()) } },
          ],
        }
      : {};

    const users = await this.userModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(MAX_RESULTS)
      .exec();

    return users.map((doc) => this.toAdmin(doc as unknown as TimestampedUser));
  }

  async findOne(id: string): Promise<AdminCitizenUser> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException();
    }
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException();
    }
    return this.toAdmin(user as unknown as TimestampedUser);
  }

  async setDisabled(id: string, disabled: boolean): Promise<AdminCitizenUser> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException();
    }
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException();
    }

    user.disabled = disabled;
    if (disabled) {
      // Su an gecerli olan tum JWT'leri aninda gecersiz kilar (bkz.
      // jwt-auth.guard.ts'deki tokenVersion karsilastirmasi).
      user.tokenVersion += 1;
    }
    await user.save();

    return this.toAdmin(user as unknown as TimestampedUser);
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  private toAdmin(doc: TimestampedUser): AdminCitizenUser {
    return {
      id: doc._id.toString(),
      ad: doc.ad,
      soyad: doc.soyad,
      tcKimlikNo: doc.tcKimlikNo ?? null,
      telefon: doc.telefon ?? null,
      eposta: doc.eposta ?? null,
      googleHesabi: !!doc.googleId,
      disabled: doc.disabled,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
