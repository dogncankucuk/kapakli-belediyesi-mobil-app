import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { CurrentUser, getSessionUser, logout } from "../api/auth";

type AppShellContextValue = {
  hasEnteredApp: boolean;
  isCheckingSession: boolean;
  user: CurrentUser | null;
  enterApp: (user: CurrentUser) => void;
  // Girişe gerek duymayan iki bilgi ekranı (Bize Ulaşın/Yardım Merkezi) icin
  // - kullanici olmadan sadece navigasyon agacini gosterir.
  previewApp: () => void;
  exitApp: () => void;
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
};

const AppShellContext = createContext<AppShellContextValue | undefined>(
  undefined,
);

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    getSessionUser()
      .then((sessionUser) => {
        if (sessionUser) {
          setUser(sessionUser);
          setHasEnteredApp(true);
        }
      })
      .finally(() => setIsCheckingSession(false));
  }, []);

  const enterApp = useCallback((sessionUser: CurrentUser) => {
    setUser(sessionUser);
    setHasEnteredApp(true);
  }, []);
  const previewApp = useCallback(() => setHasEnteredApp(true), []);
  const exitApp = useCallback(() => {
    setUser(null);
    setHasEnteredApp(false);
    void logout();
  }, []);
  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const value = useMemo(
    () => ({
      hasEnteredApp,
      isCheckingSession,
      user,
      enterApp,
      previewApp,
      exitApp,
      isMenuOpen,
      openMenu,
      closeMenu,
    }),
    [
      hasEnteredApp,
      isCheckingSession,
      user,
      enterApp,
      previewApp,
      exitApp,
      isMenuOpen,
      openMenu,
      closeMenu,
    ],
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
