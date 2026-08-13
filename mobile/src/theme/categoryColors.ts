// Pastel icon-chip accent colors for category grids (Atık Rehberi, Yeni Talep).
// Kept separate from the semantic theme tokens: these are decorative category
// accents, not light/dark-mode-aware UI colors, so they stay constant in both modes.
export type CategoryAccent = { bg: string; icon: string };

export const talepKategoriRenkleri: Record<string, CategoryAccent> = {
  cevre: { bg: "#E1EEDD", icon: "#4C7A3F" },
  hava: { bg: "#DCE7F2", icon: "#3E6C9E" },
  gurultu: { bg: "#F1E4D3", icon: "#9C7A3F" },
  atik: { bg: "#E4EFE3", icon: "#4F8A5B" },
  altyapi: { bg: "#E4E8ED", icon: "#5B7186" },
  diger: { bg: "#F3E3EA", icon: "#9C4F70" },
  // legacy categories (kept for older talep records / backward compatibility)
  "ariza-bakim": { bg: "#E4E8ED", icon: "#5B7186" },
  sikayet: { bg: "#F1E4D3", icon: "#9C7A3F" },
  "gorus-oneri": { bg: "#DCE7F2", icon: "#3E6C9E" },
};

export const atikTuruRenkleri: Record<string, CategoryAccent> = {
  "Kağıt/Karton/Plastik/Metal": { bg: "#F3E7D2", icon: "#B98A3E" },
  "Elektronik (AEEE)": { bg: "#DCEAF5", icon: "#3B6FA0" },
  Tekstil: { bg: "#EAE1F2", icon: "#7B5AA6" },
  Cam: { bg: "#E4EDE8", icon: "#3E7D74" },
  Pil: { bg: "#F8E1DE", icon: "#C2564B" },
  "Atık Getirme Merkezi": { bg: "#E9EFDD", icon: "#6B8F4E" },
  İlaç: { bg: "#FBE7D4", icon: "#C97A2B" },
  "Bitkisel Yağ": { bg: "#F3E7D2", icon: "#B98A3E" },
  "Zirai İlaç Kutusu": { bg: "#E7EFE0", icon: "#5A8A4A" },
};

export const defaultCategoryAccent: CategoryAccent = {
  bg: "#E4E8ED",
  icon: "#5B7186",
};

// Hizmetler grid'i gibi semantik olmayan (kategoriye özel değil) kart
// listelerinde sırayla döngüsel olarak kullanılan pastel palet.
export const donguselKategoriPaleti: CategoryAccent[] = [
  { bg: "#DCE7F2", icon: "#3E6C9E" },
  { bg: "#F3E7D2", icon: "#B98A3E" },
  { bg: "#E1EEDD", icon: "#4C7A3F" },
  { bg: "#F8E1DE", icon: "#C2564B" },
  { bg: "#EAE1F2", icon: "#7B5AA6" },
  { bg: "#E4EDE8", icon: "#3E7D74" },
  { bg: "#F1E4D3", icon: "#9C7A3F" },
  { bg: "#E4E8ED", icon: "#5B7186" },
];
