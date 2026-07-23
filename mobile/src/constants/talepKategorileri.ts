import { TalepKategorisi } from "../api/types";

export const talepKategorileri: { value: TalepKategorisi; label: string }[] = [
  { value: "ariza-bakim", label: "Arıza/Bakım" },
  { value: "sikayet", label: "Şikayet" },
  { value: "gorus-oneri", label: "Görüş/Öneri" },
  { value: "diger", label: "Diğer" },
];

export function talepKategorisiEtiketi(kategori: TalepKategorisi): string {
  return (
    talepKategorileri.find((secenek) => secenek.value === kategori)?.label ??
    kategori
  );
}
