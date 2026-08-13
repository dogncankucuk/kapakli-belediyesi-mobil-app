import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AseviService, PublicAseviBasvuru } from './asevi.service';
import { CreateAseviBasvuruDto } from './dto/create-asevi-basvuru.dto';

@Controller('asevi')
export class AseviController {
  constructor(private readonly aseviService: AseviService) {}

  @Throttle({ default: { limit: 10, ttl: 600_000 } })
  @Post('basvuru')
  create(@Body() dto: CreateAseviBasvuruDto): Promise<PublicAseviBasvuru> {
    return this.aseviService.create(dto);
  }
}
