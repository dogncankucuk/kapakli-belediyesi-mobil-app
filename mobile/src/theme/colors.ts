// Civic Horizon Design System — design.md §8
// v2: warm teal/cream palette (2026-08-12 redesign)
export const lightColors = {
  primary: "#1F5C56",
  onPrimary: "#FFFFFF",
  primaryContainer: "#1F5C56",
  onPrimaryContainer: "#BFE0DA",
  secondary: "#3E7D74",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#DCEEEA",
  tertiary: "#5C3A00",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#2C6E68",
  onTertiaryContainer: "#28685F",
  error: "#B3261E",
  errorContainer: "#F9DEDC",
  background: "#FBF7F1",
  onBackground: "#22302C",
  surface: "#FBF7F1",
  surfaceContainerLowest: "#FFFFFF",
  outline: "#7A756E",
  outlineVariant: "#E4DFD6",
} as const;

export const darkColors = {
  primary: "#7FC9BC",
  onPrimary: "#F3FBF9",
  primaryContainer: "#1D4A44",
  onPrimaryContainer: "#BFE0DA",
  secondary: "#6FB3A6",
  onSecondary: "#04211D",
  secondaryContainer: "#204F48",
  tertiary: "#D9C89A",
  onTertiary: "#F3FBF9",
  tertiaryContainer: "#245951",
  onTertiaryContainer: "#2C6E68",
  error: "#F2B8B5",
  errorContainer: "#8C1D18",
  background: "#12201D",
  onBackground: "#E8F0EC",
  surface: "#12201D",
  surfaceContainerLowest: "#1B2B27",
  outline: "#8FA39D",
  outlineVariant: "#3A4B46",
} as const;

export type Colors = Record<keyof typeof lightColors, string>;
export type ThemeMode = "light" | "dark";
