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
