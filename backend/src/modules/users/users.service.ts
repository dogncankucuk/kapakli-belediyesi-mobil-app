import { randomInt } from 'crypto';

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { Model } from 'mongoose';

import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User, UserDocument } from './schemas/user.schema';
import { SmsService } from './sms.service';

export type PublicUser = {
  id: string;
  ad: string;
  soyad: string;
  tcKimlikNo: string | null;
  telefon: string | null;
  eposta: string | null;
};

export type AuthResponse = { token: string; user: PublicUser };

@Injectable()
export class UsersService {
  private googleClient: OAuth2Client | null = null;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly smsService: SmsService,
  ) {}

  private findByIdentifier(identifier: string) {
    return this.userModel.findOne({
      $or: [
        { tcKimlikNo: identifier },
        { telefon: identifier },
        { eposta: identifier.toLowerCase().trim() },
      ],
    });
  }

  private toPublicUser(user: UserDocument): PublicUser {
    return {
      id: user._id.toString(),
      ad: user.ad,
      soyad: user.soyad,
      tcKimlikNo: user.tcKimlikNo ?? null,
      telefon: user.telefon ?? null,
      eposta: user.eposta ?? null,
    };
  }

  private toAuthResponse(user: UserDocument): AuthResponse {
    return {
      token: this.jwtService.sign({
        sub: user._id.toString(),
        tv: user.tokenVersion,
      }),
      user: this.toPublicUser(user),
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const eposta = dto.eposta?.toLowerCase().trim();
    const existing = await this.userModel.findOne({
      $or: [
        { tcKimlikNo: dto.tcKimlikNo },
        { telefon: dto.telefon },
        ...(eposta ? [{ eposta }] : []),
      ],
    });
    if (existing) {
      throw new ConflictException(
        'Bu T.C. kimlik no, telefon numarası veya e-posta ile zaten bir hesap var',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.userModel.create({
        ad: dto.ad,
        soyad: dto.soyad,
        tcKimlikNo: dto.tcKimlikNo,
        telefon: dto.telefon,
        eposta,
        passwordHash,
      });
      return this.toAuthResponse(user);
    } catch (err) {
      // Es zamanli iki kayit istegi arasindaki yaris durumuna karsi (yukaridaki
      // on-kontrol her ikisini de gecebilir) - unique index bunu DB seviyesinde
      // yakalar, biz sadece anlamli bir hataya ceviriyoruz.
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code?: number }).code === 11000
      ) {
        throw new ConflictException(
          'Bu T.C. kimlik no, telefon numarası veya e-posta ile zaten bir hesap var',
        );
      }
      throw err;
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.findByIdentifier(dto.identifier);

    const passwordMatches = user?.passwordHash
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Kullanıcı bulunamadı veya şifre hatalı');
    }

    if (user.disabled) {
      throw new ForbiddenException(
        'Hesabınız yönetici tarafından donduruldu. Bilgi için 444 80 59 numaralı çağrı merkezini arayabilirsiniz.',
      );
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

  // Google idToken'i dogrular, ayni googleId veya e-posta ile daha once kayit
  // olmus bir kullanici varsa onu kullanir (ve googleId'yi baglar), yoksa
  // sifresiz/T.C. kimliksiz yeni bir kullanici olusturur.
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new ServiceUnavailableException(
        'Google ile giriş şu an yapılandırılmamış',
      );
    }
    if (!this.googleClient) {
      this.googleClient = new OAuth2Client(clientId);
    }

    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Geçersiz Google oturumu');
    }

    if (!payload?.email) {
      throw new UnauthorizedException('Google hesabından e-posta alınamadı');
    }

    let user = await this.userModel.findOne({ googleId: payload.sub });
    if (!user) {
      user = await this.userModel.findOne({
        eposta: payload.email.toLowerCase(),
      });
    }

    if (!user) {
      user = await this.userModel.create({
        ad: payload.given_name ?? payload.name ?? 'Google',
        soyad: payload.family_name ?? 'Kullanıcı',
        eposta: payload.email,
        googleId: payload.sub,
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    if (user.disabled) {
      throw new ForbiddenException(
        'Hesabınız yönetici tarafından donduruldu. Bilgi için 444 80 59 numaralı çağrı merkezini arayabilirsiniz.',
      );
    }

    return this.toAuthResponse(user);
  }

  // Hesap var/yok bilgisini disariya sizdirmamak icin (kullanici numarasi
  // taramasina karsi) her durumda ayni genel mesaj donulur - SMS gercekten
  // gonderilip gonderilmedigi disaridan ayirt edilemez.
  private static readonly GENERIC_FORGOT_PASSWORD_RESPONSE = {
    message:
      'Eğer bu bilgilerle eşleşen bir hesap varsa, doğrulama kodu telefon numaranıza gönderildi.',
  };

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.findByIdentifier(dto.identifier.trim());
    // Google-only hesaplarda sifre yok, telefon da hic girilmemis olabilir -
    // bu durumlarda SMS ile ulasilacak bir numara yoktur, sessizce cik.
    if (!user || !user.telefon) {
      return UsersService.GENERIC_FORGOT_PASSWORD_RESPONSE;
    }

    const code = randomInt(100_000, 1_000_000).toString();
    user.passwordResetCodeHash = await bcrypt.hash(code, 10);
    user.passwordResetExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetAttempts = 0;
    await user.save();

    await this.smsService.send(
      user.telefon,
      `Kapaklı Belediyesi doğrulama kodunuz: ${code}. Bu kod 10 dakika geçerlidir.`,
    );

    return UsersService.GENERIC_FORGOT_PASSWORD_RESPONSE;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const invalidCodeMessage = 'Kod geçersiz veya süresi dolmuş';
    const user = await this.findByIdentifier(dto.identifier.trim());

    if (
      !user ||
      !user.passwordResetCodeHash ||
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException(invalidCodeMessage);
    }

    if (user.passwordResetAttempts >= 5) {
      throw new BadRequestException(
        'Çok fazla hatalı deneme yapıldı. Lütfen yeni bir kod isteyin.',
      );
    }

    const codeMatches = await bcrypt.compare(
      dto.code,
      user.passwordResetCodeHash,
    );
    if (!codeMatches) {
      user.passwordResetAttempts += 1;
      await user.save();
      throw new BadRequestException(invalidCodeMessage);
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    user.passwordResetCodeHash = undefined;
    user.passwordResetExpiresAt = undefined;
    user.passwordResetAttempts = 0;
    // Sifre degistiginde, calinmis olabilecek eski token'lari da gecersiz kil.
    user.tokenVersion += 1;
    await user.save();

    return { message: 'Şifreniz başarıyla güncellendi' };
  }
}
