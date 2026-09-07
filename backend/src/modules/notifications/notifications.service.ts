import { Injectable } from '@nestjs/common';
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
  async sendToUser(
    userId: string,
    kategori: string,
    baslik: string,
    govde: string,
    iliskiliTip?: string,
    iliskiliId?: string,
  ): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
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
      const filter: QueryFilter<UserDocument> = lastId
        ? { _id: { $gt: lastId } }
        : {};
      const batch = await this.userModel
        .find(filter)
        .sort({ _id: 1 })
        .limit(BATCH_SIZE)
        .exec();

      if (batch.length === 0) break;
      lastId = batch[batch.length - 1]._id;

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
      const filter: QueryFilter<UserDocument> = lastId
        ? { mahalle, _id: { $gt: lastId } }
        : { mahalle };
      const batch = await this.userModel
        .find(filter)
        .sort({ _id: 1 })
        .limit(BATCH_SIZE)
        .exec();

      if (batch.length === 0) break;
      lastId = batch[batch.length - 1]._id;

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

      if (batch.length < BATCH_SIZE) break;
    }
  }
}
