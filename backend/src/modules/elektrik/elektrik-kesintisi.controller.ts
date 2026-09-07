import { Controller, Get } from '@nestjs/common';

import {
  ElektrikKesintisiService,
  PublicElektrikKesintisi,
} from './elektrik-kesintisi.service';

@Controller('elektrik-kesintileri')
export class ElektrikKesintisiController {
  constructor(
    private readonly elektrikKesintisiService: ElektrikKesintisiService,
  ) {}

  @Get()
  findUpcoming(): Promise<PublicElektrikKesintisi[]> {
    return this.elektrikKesintisiService.findUpcoming();
  }
}
