// Civic Horizon Design System — design.md §8
export const colors = {
  primary: "#000A18",
  onPrimary: "#FFFFFF",
  primaryContainer: "#0D2236",
  onPrimaryContainer: "#768AA2",
  secondary: "#006398",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#64BAFE",
  tertiary: "#1F0001",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#4B0005",
  onTertiaryContainer: "#FC3F42",
  error: "#BA1A1A",
  errorContainer: "#FFDAD6",
  background: "#FCF9F8",
  onBackground: "#1C1B1B",
  surface: "#FCF9F8",
  surfaceContainerLowest: "#FFFFFF",
  outline: "#74777D",
  outlineVariant: "#C4C6CD",
} as const;

export type Colors = typeof colors;
