import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import Expo, { ExpoPushMessage } from 'expo-server-sdk';
import { Model } from 'mongoose';

import { PushToken, PushTokenDocument } from './schemas/push-token.schema';

interface BekleyenTicket {
  ticketId: string;
  token: string;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly expo = new Expo();

  // Gonderilen ticket'lar burada tutulup periyodik Cron job'la kontrol
  // edilir - ayri bir koleksiyon acmak bu asamada asiri muhendislik olur.
  private bekleyenTicketlar: BekleyenTicket[] = [];

  constructor(
    @InjectModel(PushToken.name)
    private readonly pushTokenModel: Model<PushTokenDocument>,
  ) {}

  async sendToTokens(
    tokens: string[],
    baslik: string,
    govde: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const messages: ExpoPushMessage[] = tokens
      .filter((token) => Expo.isExpoPushToken(token))
      .map((token) => ({
        to: token,
        title: baslik,
        body: govde,
        ...(data ? { data } : {}),
      }));

    if (messages.length === 0) return;

    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.forEach((ticket, index) => {
          if (ticket.status === 'ok') {
            this.bekleyenTicketlar.push({
              ticketId: ticket.id,
              token: chunk[index].to as string,
            });
          }
        });
      } catch (error) {
        this.logger.error('Push bildirimi gonderilemedi', error as Error);
      }
    }
  }

  // Gecersiz/kaldirilmis (DeviceNotRegistered) token'lari veritabanindan
  // temizler - Expo receipt'leri gonderimden yaklasik bir gun sonrasina
  // kadar sorgulanabilir oldugu icin 30 dakikalik periyot yeterli.
  @Cron(CronExpression.EVERY_30_MINUTES)
  async gecersizTokenlariTemizle(): Promise<void> {
    if (this.bekleyenTicketlar.length === 0) return;

    const kontrolEdilecekler = this.bekleyenTicketlar;
    this.bekleyenTicketlar = [];

    const receiptIdChunks = this.expo.chunkPushNotificationReceiptIds(
      kontrolEdilecekler.map((t) => t.ticketId),
    );

    for (const chunk of receiptIdChunks) {
      try {
        const receipts =
          await this.expo.getPushNotificationReceiptsAsync(chunk);
        for (const [receiptId, receipt] of Object.entries(receipts)) {
          if (
            receipt.status === 'error' &&
            receipt.details?.error === 'DeviceNotRegistered'
          ) {
            const eslesen = kontrolEdilecekler.find(
              (t) => t.ticketId === receiptId,
            );
            if (eslesen) {
              await this.pushTokenModel
                .deleteOne({ token: eslesen.token })
                .exec();
            }
          }
        }
      } catch (error) {
        this.logger.error('Push receipt kontrolu basarisiz', error as Error);
      }
    }
  }
}
