// Mobil (constants/atikTurleri.ts) ve admin panel (types.ts) tarafinda da
// birebir ayni sekilde tanimli sabit atik turu listesi - AI siniflandirma ve
// Atik Konumlari filtreleri de bu listeyi kullanir.
export const ATIK_TURLERI = [
  'Kağıt/Karton/Plastik/Metal',
  'Elektronik (AEEE)',
  'Tekstil',
  'Cam',
  'Pil',
  'Atık Getirme Merkezi',
  'İlaç',
  'Bitkisel Yağ',
  'Zirai İlaç Kutusu',
] as const;

export type AtikTuru = (typeof ATIK_TURLERI)[number];
