import { Controller, Get } from '@nestjs/common';

import { PharmaciesService, PublicPharmacy } from './pharmacies.service';

@Controller('pharmacies')
export class PharmaciesController {
  constructor(private readonly pharmaciesService: PharmaciesService) {}

  @Get()
  findAll(): Promise<PublicPharmacy[]> {
    return this.pharmaciesService.findAll();
  }

  @Get('nobetci')
  findNobetci(): Promise<PublicPharmacy[]> {
    return this.pharmaciesService.findNobetci();
  }
}
