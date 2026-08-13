import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AtikSiniflandirmaController } from './atik-siniflandirma.controller';
import { AtikSiniflandirmaService } from './atik-siniflandirma.service';
import {
  AtikTaramaKaydi,
  AtikTaramaKaydiSchema,
} from './schemas/atik-tarama-kaydi.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AtikTaramaKaydi.name, schema: AtikTaramaKaydiSchema },
    ]),
  ],
  controllers: [AtikSiniflandirmaController],
  providers: [AtikSiniflandirmaService],
})
export class AtikSiniflandirmaModule {}
