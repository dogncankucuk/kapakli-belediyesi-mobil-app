import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CbsKaynakService, CbsSenkronizeSonucu } from '../cbs/cbs-kaynak.service';
import { CreateAtikNoktasiDto } from './dto/create-atik-noktasi.dto';
import { UpdateAtikNoktasiDto } from './dto/update-atik-noktasi.dto';
import {
  AtikNoktasi,
  AtikNoktasiDocument,
} from './schemas/atik-noktasi.schema';

// CBS katman adi -> bu koleksiyondaki "tur" degeri (mobil taraftaki
// ATIK_TURLERI listesiyle birebir eslesiyor). Bu katmanlarda "name" cogu
// zaman jenerik/tekrarli (ör. "ATIK GETİRME ARACI" x17) oldugundan ad+tur
// yerine CBS'in kendi poi_id'si ile eslestirme yapiliyor.
const CBS_ATIK_KATMANLARI: Record<string, string> = {
  'gisoft:gi_poi_kagit_metal_kumbara': 'Kağıt/Karton/Plastik/Metal',
  'gisoft:gi_poi_elektronik_toplama': 'Elektronik (AEEE)',
  'gisoft:gi_poi_tekstil_atik_kumbarasi': 'Tekstil',
  'gisoft:gi_poi_cam_atik_kumbarasi': 'Cam',
  'gisoft:gi_poi_atik_pil_toplama': 'Pil',
  'gisoft:gi_poi_atik_getirme_merkezleri': 'Atık Getirme Merkezi',
  'gisoft:gi_poi_atik_getirme_araci': 'Atık Getirme Merkezi',
  'gisoft:gi_poi_atik_ilac_toplama': 'İlaç',
  'gisoft:gi_poi_bitkisel_atik_yag_top': 'Bitkisel Yağ',
  'gisoft:gi_poi_atik_zirai_ilac_kumbara': 'Zirai İlaç Kutusu',
};

export interface AdminAtikNoktasi {
  id: string;
  ad: string;
  tur: string;
  adres: string | null;
  lat: number;
  lng: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedAtikNoktasi = AtikNoktasiDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminAtikNoktalariService {
  constructor(
    @InjectModel(AtikNoktasi.name)
    private readonly atikNoktasiModel: Model<AtikNoktasiDocument>,
    private readonly cbsKaynakService: CbsKaynakService,
  ) {}

  async cbsSenkronize(updatedBy: string): Promise<CbsSenkronizeSonucu> {
    let bulunan = 0;
    let eklenen = 0;
    let guncellenen = 0;
    for (const [typeName, tur] of Object.entries(CBS_ATIK_KATMANLARI)) {
      const poiler = await this.cbsKaynakService.getPois(typeName);
      bulunan += poiler.length;
      for (const poi of poiler) {
        if (!poi.poiId) continue;
        const adres = await this.cbsKaynakService.getAdres(poi.districtId);
        const mevcut = await this.atikNoktasiModel
          .exists({ cbsPoiId: poi.poiId })
          .exec();
        await this.atikNoktasiModel
          .findOneAndUpdate(
            { cbsPoiId: poi.poiId },
            {
              ad: poi.ad,
              tur,
              lat: poi.lat,
              lng: poi.lng,
              adres: adres ?? undefined,
              updatedBy,
              cbsPoiId: poi.poiId,
            },
            { upsert: true },
          )
          .exec();
        if (mevcut) guncellenen++;
        else eklenen++;
      }
    }
    return { bulunan, eklenen, guncellenen };
  }

  async findAll(): Promise<AdminAtikNoktasi[]> {
    const noktalar = await this.atikNoktasiModel.find().sort({ ad: 1 }).exec();
    return noktalar.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedAtikNoktasi),
    );
  }

  async findOne(id: string): Promise<AdminAtikNoktasi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.atikNoktasiModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedAtikNoktasi) : null;
  }

  async create(
    dto: CreateAtikNoktasiDto,
    updatedBy: string,
  ): Promise<AdminAtikNoktasi> {
    const created = (await this.atikNoktasiModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedAtikNoktasi;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateAtikNoktasiDto,
    updatedBy: string,
  ): Promise<AdminAtikNoktasi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.atikNoktasiModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedAtikNoktasi) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.atikNoktasiModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedAtikNoktasi): AdminAtikNoktasi {
    return {
      id: doc._id.toString(),
      ad: doc.ad,
      tur: doc.tur,
      adres: doc.adres ?? null,
      lat: doc.lat,
      lng: doc.lng,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
