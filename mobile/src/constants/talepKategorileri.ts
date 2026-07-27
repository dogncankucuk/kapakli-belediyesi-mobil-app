import { TalepKategorisi } from "../api/types";
import { TranslationKey } from "../i18n/tr";

const talepKategorisiLabelKeys: Record<TalepKategorisi, TranslationKey> = {
  "ariza-bakim": "talepKategorisi_arizaBakim",
  sikayet: "talepKategorisi_sikayet",
  "gorus-oneri": "talepKategorisi_gorusOneri",
  diger: "talepKategorisi_diger",
};

const talepKategorisiSirasi: TalepKategorisi[] = [
  "ariza-bakim",
  "sikayet",
  "gorus-oneri",
  "diger",
];

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
