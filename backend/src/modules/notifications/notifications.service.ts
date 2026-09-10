import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';

import { User, UserDocument } from '../users/schemas/user.schema';
import { PushService } from './push.service';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { PushToken, PushTokenDocument } from './schemas/push-token.schema';

const BATCH_SIZE = 500;

function iliskiliData(
  iliskiliTip?: string,
  iliskiliId?: string,
): Record<string, string> | undefined {
  if (!iliskiliTip && !iliskiliId) return undefined;
  const data: Record<string, string> = {};
  if (iliskiliTip) data.iliskiliTip = iliskiliTip;
  if (iliskiliId) data.iliskiliId = iliskiliId;
  return data;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(PushToken.name)
    private readonly pushTokenModel: Model<PushTokenDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly pushService: PushService,
  ) {}

  async registerPushToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android',
  ): Promise<void> {
    await this.pushTokenModel
      .findOneAndUpdate(
        { token },
        { userId, token, platform },
        { upsert: true },
      )
      .exec();
  }

  async removePushToken(userId: string, token: string): Promise<void> {
    await this.pushTokenModel.deleteOne({ userId, token }).exec();
  }

  // govde asla hassas veri icermemeli (TCKN, talep no, red sebebi vb.) -
  // bu metodu cagiran kod her zaman genel/anonim metin gecmelidir.
  // userId disaridan (ör. eski/bozuk bir kayittan) gecersiz gelebilir -
  // findById'nin CastError firlatmasini onlemek icin once formatini dogrula.
  async sendToUser(
    userId: string,
    kategori: string,
    baslik: string,
    govde: string,
    iliskiliTip?: string,
    iliskiliId?: string,
  ): Promise<void> {
    if (!userId || !Types.ObjectId.isValid(userId)) return;

    try {
      const user = await this.userModel
        .findById(userId)
        .select('_id bildirimTercihleri')
        .exec();
      if (!user || user.bildirimTercihleri?.[kategori] === false) {
        return;
      }

      await this.notificationModel.create({
        userId,
        kategori,
        baslik,
        govde,
        iliskiliTip: iliskiliTip ?? null,
        iliskiliId: iliskiliId ?? null,
      });

      const tokens = await this.pushTokenModel.find({ userId }).exec();
      await this.pushService.sendToTokens(
        tokens.map((t) => t.token),
        baslik,
        govde,
        iliskiliData(iliskiliTip, iliskiliId),
      );
    } catch (err) {
      this.logger.error('sendToUser basarisiz', err as Error);
    }
  }

  // govde asla hassas veri icermemeli (bkz. sendToUser). Kullanici sayisi
  // buyuyebilecegi icin tum koleksiyon tek seferde belleğe alinmiyor,
  // _id'ye gore siralı batch'ler halinde taraniyor.
  async sendBroadcast(
    kategori: string,
    baslik: string,
    govde: string,
    iliskiliTip?: string,
    iliskiliId?: string,
  ): Promise<void> {
    let lastId: Types.ObjectId | undefined;

    for (;;) {
      const filter: QueryFilter<UserDocument> = {
        disabled: { $ne: true },
        ...(lastId ? { _id: { $gt: lastId } } : {}),
      };
      const batch = await this.userModel
        .find(filter)
        .select('_id bildirimTercihleri')
        .sort({ _id: 1 })
        .limit(BATCH_SIZE)
        .exec();

      if (batch.length === 0) break;
      lastId = batch[batch.length - 1]._id;

      try {
        const kabulEdenler = batch.filter(
          (user) => user.bildirimTercihleri?.[kategori] !== false,
        );

        if (kabulEdenler.length > 0) {
          const userIds = kabulEdenler.map((u) => u._id.toString());

          await this.notificationModel.insertMany(
            userIds.map((userId) => ({
              userId,
              kategori,
              baslik,
              govde,
              iliskiliTip: iliskiliTip ?? null,
              iliskiliId: iliskiliId ?? null,
            })),
          );

          const tokens = await this.pushTokenModel
            .find({ userId: { $in: userIds } })
            .exec();
          await this.pushService.sendToTokens(
            tokens.map((t) => t.token),
            baslik,
            govde,
            iliskiliData(iliskiliTip, iliskiliId),
          );
        }
      } catch (err) {
        this.logger.error('sendBroadcast batch basarisiz', err as Error);
      }

      if (batch.length < BATCH_SIZE) break;
    }
  }

  // Admin panelden gonderilen serbest metinli/manuel duyurular icin: herhangi
  // bir icerik kategorisine bagli olmadigindan (bkz. NotificationsPage.tsx'in
  // artik kategori secimi sunmamasi) kategori tercihi kontrol edilmeden,
  // sadece hesabi devre disi olmayan TUM kullanicilara gonderilir.
  async sendBroadcastToAll(
    baslik: string,
    govde: string,
    fotografUrl?: string,
  ): Promise<void> {
    let lastId: Types.ObjectId | undefined;

    for (;;) {
      const filter: QueryFilter<UserDocument> = {
        disabled: { $ne: true },
        ...(lastId ? { _id: { $gt: lastId } } : {}),
      };
      const batch = await this.userModel
        .find(filter)
        .select('_id')
        .sort({ _id: 1 })
        .limit(BATCH_SIZE)
        .exec();

      if (batch.length === 0) break;
      lastId = batch[batch.length - 1]._id;

      try {
        const userIds = batch.map((u) => u._id.toString());

        await this.notificationModel.insertMany(
          userIds.map((userId) => ({
            userId,
            kategori: 'manuel',
            baslik,
            govde,
            fotografUrl: fotografUrl ?? null,
          })),
        );

        const tokens = await this.pushTokenModel
          .find({ userId: { $in: userIds } })
          .exec();
        await this.pushService.sendToTokens(
          tokens.map((t) => t.token),
          baslik,
          govde,
          fotografUrl ? { fotografUrl } : undefined,
        );
      } catch (err) {
        this.logger.error('sendBroadcastToAll batch basarisiz', err as Error);
      }

      if (batch.length < BATCH_SIZE) break;
    }
  }

  // sendBroadcast ile ayni batched-cursor yapisi, tek fark filtreye mahalle
  // ekleniyor - bos/tanimsiz mahalleye kimseye gitmemesi icin guard var.
  async sendToMahalle(
    mahalle: string,
    kategori: string,
    baslik: string,
    govde: string,
    iliskiliTip?: string,
    iliskiliId?: string,
  ): Promise<void> {
    if (!mahalle) return;

    let lastId: Types.ObjectId | undefined;

    for (;;) {
      const filter: QueryFilter<UserDocument> = {
        mahalle,
        disabled: { $ne: true },
        ...(lastId ? { _id: { $gt: lastId } } : {}),
      };
      const batch = await this.userModel
        .find(filter)
        .select('_id bildirimTercihleri')
        .sort({ _id: 1 })
        .limit(BATCH_SIZE)
        .exec();

      if (batch.length === 0) break;
      lastId = batch[batch.length - 1]._id;

      try {
        const kabulEdenler = batch.filter(
          (user) => user.bildirimTercihleri?.[kategori] !== false,
        );

        if (kabulEdenler.length > 0) {
          const userIds = kabulEdenler.map((u) => u._id.toString());

          await this.notificationModel.insertMany(
            userIds.map((userId) => ({
              userId,
              kategori,
              baslik,
              govde,
              iliskiliTip: iliskiliTip ?? null,
              iliskiliId: iliskiliId ?? null,
            })),
          );

          const tokens = await this.pushTokenModel
            .find({ userId: { $in: userIds } })
            .exec();
          await this.pushService.sendToTokens(
            tokens.map((t) => t.token),
            baslik,
            govde,
            iliskiliData(iliskiliTip, iliskiliId),
          );
        }
      } catch (err) {
        this.logger.error('sendToMahalle batch basarisiz', err as Error);
      }

      if (batch.length < BATCH_SIZE) break;
    }
  }
}
