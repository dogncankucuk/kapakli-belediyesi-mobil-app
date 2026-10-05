import { randomInt, randomUUID } from 'crypto';
import { unlink, writeFile } from 'fs/promises';
import { join } from 'path';

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

import { UPLOADS_DIR } from '../../uploads-dir';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, UserDocument } from './schemas/user.schema';
import { SmsService } from './sms.service';

export type PublicUser = {
  id: string;
  ad: string;
  soyad: string;
  tcKimlikNo: string | null;
  telefon: string | null;
  eposta: string | null;
  mahalle: string | null;
  adres: string | null;
  profilFotografiUrl: string | null;
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

  // Giris/sifre sifirlama artik sadece T.C. kimlik no ile yapilabiliyor -
  // telefon/e-posta ile giris kabul edilmiyor (urun karari). Sifre
  // sifirlama SMS'i yine de kullanicinin kayitli telefonuna gider, bu
  // sadece "hangi alanla kullanici bulunur" kismini kisitlar.
  private findByIdentifier(identifier: string) {
    return this.userModel.findOne({ tcKimlikNo: identifier });
  }

  private toPublicUser(user: UserDocument): PublicUser {
    return {
      id: user._id.toString(),
      ad: user.ad,
      soyad: user.soyad,
      tcKimlikNo: user.tcKimlikNo ?? null,
      telefon: user.telefon ?? null,
      eposta: user.eposta ?? null,
      mahalle: user.mahalle ?? null,
      adres: user.adres ?? null,
      profilFotografiUrl: user.profilFotografiUrl ?? null,
    };
  }

  // Base64'u decode etmeden guvenilir bir icerik kontrolu yapilamiyor - decode
  // sonrasi "magic bytes" (dosyanin ilk birkac byte'i) ile JPEG/PNG disinda
  // bir seyin (ornegin calistirilabilir bir dosya) yuklenmesi engelleniyor.
  private gorselGecerliMi(buffer: Buffer): boolean {
    const jpeg =
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;
    const png =
      buffer.length >= 4 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;
    return jpeg || png;
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

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<PublicUser> {
    // dto.profilFotografiBase64 DB semasinda yok, dogrudan yazilmiyor -
    // yerine medya kutuphanesiyle ayni mantikla /uploads'a dosya olarak
    // yazilip goreceli URL'i turetiliyor (bkz. RequestsService.fotograflariKaydet).
    const update: { mahalle?: string; adres?: string; profilFotografiUrl?: string } =
      {};
    if (dto.mahalle !== undefined) update.mahalle = dto.mahalle;
    if (dto.adres !== undefined) update.adres = dto.adres;

    let eskiFotografUrl: string | undefined;
    if (dto.profilFotografiBase64) {
      const buffer = Buffer.from(dto.profilFotografiBase64, 'base64');
      if (!this.gorselGecerliMi(buffer)) {
        throw new BadRequestException('Geçersiz görsel formatı');
      }

      const mevcutKullanici = await this.userModel.findById(userId);
      eskiFotografUrl = mevcutKullanici?.profilFotografiUrl ?? undefined;

      const dosyaAdi = `${randomUUID()}.jpg`;
      await writeFile(join(UPLOADS_DIR, dosyaAdi), buffer);
      update.profilFotografiUrl = `/uploads/${dosyaAdi}`;
    }

    const user = await this.userModel.findByIdAndUpdate(userId, update, {
      new: true,
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    if (eskiFotografUrl) {
      await unlink(
        join(UPLOADS_DIR, eskiFotografUrl.replace('/uploads/', '')),
      ).catch(() => {});
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

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<AuthResponse & { message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.passwordHash) {
      throw new BadRequestException(
        'Google hesabınız için şifre değiştirilemez',
      );
    }

    const passwordMatches = await bcrypt.compare(
      dto.mevcutSifre,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Mevcut şifreniz hatalı');
    }

    user.passwordHash = await bcrypt.hash(dto.yeniSifre, 10);
    // Sifre degistiginde, calinmis olabilecek eski token'lari da gecersiz kil
    // (resetPassword ile ayni gerekce) - ama burada kullanici HALEN oturum
    // acik/kimligi dogrulanmis durumda oldugu icin (JwtAuthGuard), onu disari
    // atmak yerine tv'nin yeni degeriyle imzalanmis TAZE bir token donuyoruz -
    // sadece BASKA cihazlardaki eski token'lar gecersiz olur.
    user.tokenVersion += 1;
    await user.save();

    return {
      ...this.toAuthResponse(user),
      message: 'Şifreniz başarıyla güncellendi',
    };
  }
}
