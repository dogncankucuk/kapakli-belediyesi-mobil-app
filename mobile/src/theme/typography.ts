// Civic Horizon typography scale — design.md §8
// Inter font not bundled yet; falls back to the system font this tour.
export const typography = {
  displayLg: { fontSize: 32, fontWeight: "700", lineHeight: 40 },
  headlineMd: { fontSize: 24, fontWeight: "700", lineHeight: 32 },
  headlineMdMobile: { fontSize: 22, fontWeight: "700", lineHeight: 28 },
  titleLg: { fontSize: 20, fontWeight: "700", lineHeight: 28 },
  titleMd: { fontSize: 18, fontWeight: "600", lineHeight: 24 },
  bodyLg: { fontSize: 16, fontWeight: "400", lineHeight: 24 },
  bodyMd: { fontSize: 14, fontWeight: "400", lineHeight: 20 },
  labelLg: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  labelSm: { fontSize: 12, fontWeight: "500", lineHeight: 16 },
} as const;

export type Typography = typeof typography;

// Ayarlar > Yazı Boyutu icin secilebilir olcek adimlari.
export const FONT_SCALE_STEPS = [0.9, 1, 1.15, 1.3] as const;
export type FontScale = (typeof FONT_SCALE_STEPS)[number];
export const DEFAULT_FONT_SCALE: FontScale = 1;

// typography sabitini verilen olcekle carpip yeni bir nesne dondurur -
// fontSize ve lineHeight orantili buyur/kucultur, fontWeight aynen kalir.
export function scaleTypography(scale: number): Typography {
  const entries = Object.entries(typography).map(([key, value]) => [
    key,
    {
      ...value,
      fontSize: Math.round(value.fontSize * scale),
      lineHeight: Math.round(value.lineHeight * scale),
    },
  ]);
  return Object.fromEntries(entries) as Typography;
}
