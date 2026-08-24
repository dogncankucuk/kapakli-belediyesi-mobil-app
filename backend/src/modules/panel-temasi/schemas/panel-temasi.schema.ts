import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PanelTemasiDocument = HydratedDocument<PanelTemasi>;

// Tek kayitlik (singleton) icerik - admin panelin KENDI gorunumunu
// (renkler/font/kose yuvarlakligi) kontrol eder. Mobil uygulama temasindan
// (bkz. TemaAyarlari) farkli - bu panel-temasi.schema.ts sadece bu React
// admin panelini etkiler, canli olarak App.tsx tarafindan uygulanir.
@Schema({ timestamps: true, collection: 'panelTemasi' })
export class PanelTemasi {
  @Prop({ required: true, default: '#1F5C56' })
  primaryColor: string;

  @Prop({ required: true, default: '#3E7D74' })
  secondaryColor: string;

  @Prop({ required: true, default: '#FBF7F1' })
  backgroundColor: string;

  @Prop({ required: true, default: '#FFFFFF' })
  surfaceColor: string;

  @Prop({ required: true, default: '#22302C' })
  textColor: string;

  @Prop({ required: true, default: '#E4DFD6' })
  borderColor: string;

  @Prop({ required: true, default: "'Segoe UI', system-ui, Roboto, sans-serif" })
  fontFamily: string;

  @Prop({ required: true, default: 10 })
  radius: number;

  @Prop()
  updatedBy?: string;
}

export const PanelTemasiSchema = SchemaFactory.createForClass(PanelTemasi);
