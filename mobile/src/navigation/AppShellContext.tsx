import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type AppShellContextValue = {
  hasEnteredApp: boolean;
  enterApp: () => void;
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
};

const AppShellContext = createContext<AppShellContextValue | undefined>(
  undefined,
);

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const enterApp = useCallback(() => setHasEnteredApp(true), []);
  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const value = useMemo(
    () => ({ hasEnteredApp, enterApp, isMenuOpen, openMenu, closeMenu }),
    [hasEnteredApp, isMenuOpen, enterApp, openMenu, closeMenu],
  );

  return (
    <AppShellContext.Provider value={value}>
      {children}
    </AppShellContext.Provider>
  );
}

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShell must be used within an AppShellProvider");
  }
  return context;
}
