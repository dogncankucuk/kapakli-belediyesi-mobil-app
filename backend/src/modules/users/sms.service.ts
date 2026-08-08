import { Injectable, Logger } from '@nestjs/common';

// Henuz gercek bir SMS saglayicisi (Netgsm, Vatan SMS, Twilio vb.)
// baglanmadi - kod, saglayici entegre edilene kadar mesaji sadece konsola
// yazdirir (dev/test icinde calisir durumda; sifremi-unuttum kodlarini
// backend loglarindan okuyup test edebilirsiniz). Production'a cikmadan once
// bu sinifin govdesi gercek bir saglayicinin API cagrisiyla degistirilmeli -
// disaridan cagiran kod (users.service.ts) hic degismeden calismaya devam eder.
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  send(to: string, message: string): Promise<void> {
    this.logger.warn(
      `[SMS sağlayıcısı henüz yapılandırılmadı - gönderilmiş SAYILMAZ] -> ${to}: ${message}`,
    );
    return Promise.resolve();
  }
}
