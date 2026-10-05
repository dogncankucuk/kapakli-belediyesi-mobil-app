import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MedyaModule } from '../medya/medya.module';
import { Departman, DepartmanSchema } from './schemas/departman.schema';
import { AdminDepartmanlarController } from './admin-departmanlar.controller';
import { DepartmanlarService } from './departmanlar.service';

// @Global: AdminUsersService (kullaniciya departman atarken adini dogrulamak
// icin) ve MedyaModule (klasor gorunurlugu icin) Departman modeline
// erisiyor - RolesModule/AdminUsersModule ile ayni gerekce. MedyaModule
// kendisi global degil, bu yuzden DepartmanlarService'in ihtiyac duydugu
// MedyaKlasoru modelini almak icin burada acikca import ediliyor (tek
// yonlu - MedyaModule'un DepartmanlarModule'u import etmesine gerek yok,
// bu modul zaten global).
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Departman.name, schema: DepartmanSchema },
    ]),
    MedyaModule,
  ],
  controllers: [AdminDepartmanlarController],
  providers: [DepartmanlarService],
  exports: [MongooseModule],
})
export class DepartmanlarModule {}
