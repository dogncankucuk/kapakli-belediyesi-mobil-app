// Civic Horizon Design System — design.md §8
export const lightColors = {
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

export const darkColors = {
  primary: "#A9C7FF",
  onPrimary: "#00315C",
  primaryContainer: "#194975",
  onPrimaryContainer: "#D3E4FF",
  secondary: "#8ECDFF",
  onSecondary: "#00344E",
  secondaryContainer: "#004C6F",
  tertiary: "#FFB4A9",
  onTertiary: "#680003",
  tertiaryContainer: "#930006",
  onTertiaryContainer: "#FFDAD4",
  error: "#FFB4AB",
  errorContainer: "#93000A",
  background: "#141414",
  onBackground: "#E5E2E1",
  surface: "#141414",
  surfaceContainerLowest: "#242424",
  outline: "#8E9099",
  outlineVariant: "#44474A",
} as const;

export type Colors = Record<keyof typeof lightColors, string>;
export type ThemeMode = "light" | "dark";
