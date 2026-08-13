import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import session from 'express-session';
import { json } from 'express';

import { AppModule } from './app.module';

async function bootstrap() {
  // Atik siniflandirma (yapay zeka goruntu analizi) base64 kodlu fotograf
  // govdesi tasiyor - Nest'in varsayilan body-parser limiti (100kb) bunun
  // icin cok kucuk, o yuzden otomatik body-parser kapatilip elle, daha
  // yuksek bir limitle kuruldu.
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(json({ limit: '10mb' }));
  const configService = app.get(ConfigService);

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(
    session({
      secret: configService.getOrThrow<string>('ADMIN_SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    }),
  );

  // CORS_ORIGIN: virgulle ayrilmis izinli origin listesi (ornek:
  // "https://kapakli.bel.tr,https://admin.kapakli.bel.tr"). Boş bırakılırsa
  // (yalnizca gelistirme icin) tum originlere izin verilir - production'da
  // MUTLAKA ayarlanmalidir. Admin paneli production'da bu sunucudan /admin
  // altinda servis edildigi icin (ayni origin) CORS'tan etkilenmez; bu ayar
  // esas olarak mobil disi (tarayici tabanli) istemcileri sinirlar.
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',').map((o) => o.trim()) : true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
