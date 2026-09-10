import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Colors, darkColors, lightColors, ThemeMode } from "./colors";
import {
  DEFAULT_FONT_SCALE,
  FontScale,
  scaleTypography,
  Typography,
} from "./typography";

const STORAGE_KEY = "@kapakli/theme_mode";
const FONT_SCALE_STORAGE_KEY = "@kapakli/font_scale";

type ThemeContextValue = {
  mode: ThemeMode;
  colors: Colors;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
  typography: Typography;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [fontScale, setFontScaleState] =
    useState<FontScale>(DEFAULT_FONT_SCALE);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark") {
        setModeState(stored);
      }
    });
    AsyncStorage.getItem(FONT_SCALE_STORAGE_KEY).then((stored) => {
      const parsed = stored ? Number(stored) : null;
      if (parsed && !Number.isNaN(parsed)) {
        setFontScaleState(parsed as FontScale);
      }
    });
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((current) => {
      const next = current === "light" ? "dark" : "light";
      void AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const setFontScale = useCallback((next: FontScale) => {
    setFontScaleState(next);
    void AsyncStorage.setItem(FONT_SCALE_STORAGE_KEY, String(next));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: mode === "dark" ? darkColors : lightColors,
      setMode,
      toggleMode,
      fontScale,
      setFontScale,
      typography: scaleTypography(fontScale),
    }),
    [mode, setMode, toggleMode, fontScale, setFontScale],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function useThemeColors(): Colors {
  return useTheme().colors;
}

export function useTypography(): Typography {
  return useTheme().typography;
}
