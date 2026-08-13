import { MaterialIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";

import { TalepKategorisi } from "../api/types";
import { TranslationKey } from "../i18n/tr";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

const talepKategorisiLabelKeys: Record<TalepKategorisi, TranslationKey> = {
  cevre: "talepKategorisi_cevre",
  hava: "talepKategorisi_hava",
  gurultu: "talepKategorisi_gurultu",
  atik: "talepKategorisi_atik",
  altyapi: "talepKategorisi_altyapi",
  diger: "talepKategorisi_diger",
  // eski kategoriler - geçmiş kayıtların etiketini göstermeye devam eder
  "ariza-bakim": "talepKategorisi_arizaBakim",
  sikayet: "talepKategorisi_sikayet",
  "gorus-oneri": "talepKategorisi_gorusOneri",
};

// Yeni talep oluştururken seçilebilen 6 kategori (design.md'nin mockup'ıyla
// hizalı) - eski 3 kategori (ariza-bakim/sikayet/gorus-oneri) kasıtlı olarak
// bu listede yok, sadece geçmiş kayıtlarda görünmeye devam ediyor.
const talepKategorisiSirasi: TalepKategorisi[] = [
  "cevre",
  "hava",
  "gurultu",
  "atik",
  "altyapi",
  "diger",
];

const talepKategorisiIkonlari: Record<TalepKategorisi, IconName> = {
  cevre: "eco",
  hava: "air",
  gurultu: "volume-up",
  atik: "delete-outline",
  altyapi: "bolt",
  diger: "tag",
  "ariza-bakim": "build",
  sikayet: "campaign",
  "gorus-oneri": "lightbulb",
};

const talepKategorisiSubtitleKeys: Record<TalepKategorisi, TranslationKey> = {
  cevre: "talepKategorisi_cevreAlt",
  hava: "talepKategorisi_havaAlt",
  gurultu: "talepKategorisi_gurultuAlt",
  atik: "talepKategorisi_atikAlt",
  altyapi: "talepKategorisi_altyapiAlt",
  diger: "talepKategorisi_digerAlt",
  "ariza-bakim": "talepKategorisi_arizaBakim",
  sikayet: "talepKategorisi_sikayet",
  "gorus-oneri": "talepKategorisi_gorusOneri",
};

// Koku/gürültü/kirlilik yoğunluk seçicisi sadece bu kategorilerde anlamlı.
export const YOGUNLUK_GOSTEREN_KATEGORILER: TalepKategorisi[] = [
  "cevre",
  "hava",
  "gurultu",
];

export type TalepKategoriTanimi = {
  value: TalepKategorisi;
  label: string;
  subtitle: string;
  icon: IconName;
};

export function buildTalepKategoriTanimlari(
  t: (key: TranslationKey) => string,
): TalepKategoriTanimi[] {
  return talepKategorisiSirasi.map((value) => ({
    value,
    label: t(talepKategorisiLabelKeys[value]),
    subtitle: t(talepKategorisiSubtitleKeys[value]),
    icon: talepKategorisiIkonlari[value],
  }));
}

export function buildTalepKategorileri(
  t: (key: TranslationKey) => string,
): { value: TalepKategorisi; label: string }[] {
  return talepKategorisiSirasi.map((value) => ({
    value,
    label: t(talepKategorisiLabelKeys[value]),
  }));
}

export function talepKategorisiEtiketi(
  kategori: TalepKategorisi,
  t: (key: TranslationKey) => string,
): string {
  return t(talepKategorisiLabelKeys[kategori]);
}
