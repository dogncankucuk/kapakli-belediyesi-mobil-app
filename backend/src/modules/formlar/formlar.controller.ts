import { Controller, Get } from '@nestjs/common';

import { FormlarService, PublicFormBelgesi } from './formlar.service';

@Controller('formlar')
export class FormlarController {
  constructor(private readonly formlarService: FormlarService) {}

  @Get()
  findAll(): Promise<PublicFormBelgesi[]> {
    return this.formlarService.findAll();
  }
}
