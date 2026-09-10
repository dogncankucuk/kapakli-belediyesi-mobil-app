import { Module } from '@nestjs/common';

import { CbsKaynakService } from './cbs-kaynak.service';

@Module({
  providers: [CbsKaynakService],
  exports: [CbsKaynakService],
})
export class CbsModule {}
