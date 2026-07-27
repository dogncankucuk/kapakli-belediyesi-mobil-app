import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User, UserDocument } from './schemas/user.schema';

export type PublicUser = {
  id: string;
  ad: string;
  soyad: string;
  tcKimlikNo: string;
  telefon: string;
  eposta: string | null;
};

export type AuthResponse = { token: string; user: PublicUser };

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  private toPublicUser(user: UserDocument): PublicUser {
    return {
      id: user._id.toString(),
      ad: user.ad,
      soyad: user.soyad,
      tcKimlikNo: user.tcKimlikNo,
      telefon: user.telefon,
      eposta: user.eposta ?? null,
    };
  }

  private toAuthResponse(user: UserDocument): AuthResponse {
    return {
      token: this.jwtService.sign({ sub: user._id.toString() }),
      user: this.toPublicUser(user),
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.userModel.findOne({
      $or: [{ tcKimlikNo: dto.tcKimlikNo }, { telefon: dto.telefon }],
    });
    if (existing) {
      throw new ConflictException(
        'Bu T.C. kimlik no veya telefon numarasıyla zaten bir hesap var',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      ad: dto.ad,
      soyad: dto.soyad,
      tcKimlikNo: dto.tcKimlikNo,
      telefon: dto.telefon,
      eposta: dto.eposta,
      passwordHash,
    });

    return this.toAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userModel.findOne({
      $or: [
        { tcKimlikNo: dto.identifier },
        { telefon: dto.identifier },
        { eposta: dto.identifier },
      ],
    });

    const passwordMatches = user
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Kullanıcı bulunamadı veya şifre hatalı');
    }

    return this.toAuthResponse(user);
  }

  async findById(id: string): Promise<PublicUser> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.toPublicUser(user);
  }
}
