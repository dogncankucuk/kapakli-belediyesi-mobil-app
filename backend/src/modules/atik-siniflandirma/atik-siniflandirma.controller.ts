import { Body, Controller, Get, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import {
  AtikSiniflandirmaService,
  AtikSiniflandirmaSonucu,
  AtikTaramaIstatistigi,
} from './atik-siniflandirma.service';
import { ClassifyAtikDto } from './dto/classify-atik.dto';

@Controller('atik-siniflandirma')
export class AtikSiniflandirmaController {
  constructor(
    private readonly atikSiniflandirmaService: AtikSiniflandirmaService,
  ) {}

  // Her istek bir Claude API cagrisi tetikledigi icin (maliyetli), asevi
  // basvurusuyla ayni siki limit uygulanuyor.
  @Throttle({ default: { limit: 10, ttl: 600_000 } })
  @Post()
  classify(@Body() dto: ClassifyAtikDto): Promise<AtikSiniflandirmaSonucu> {
    return this.atikSiniflandirmaService.classify(dto);
  }

  @Get('istatistik')
  istatistik(): Promise<AtikTaramaIstatistigi> {
    return this.atikSiniflandirmaService.getIstatistik();
  }
}
