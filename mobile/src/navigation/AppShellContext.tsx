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
import { ServiceTarget } from "../constants/serviceCatalog";

export type PendingRoute = ServiceTarget;

type AppShellContextValue = {
  hasEnteredApp: boolean;
  isCheckingSession: boolean;
  user: CurrentUser | null;
  enterApp: (user: CurrentUser) => void;
  // Girişe gerek duymayan iki bilgi ekranı (Bize Ulaşın/Yardım Merkezi) icin
  // - kullanici olmadan sadece navigasyon agacini gosterir.
  // target verilirse (ör. login öncesi haritaya git), Navigation mount olup
  // hazır hale gelir gelmez o rotaya gidilir - bkz. navigation/index.tsx onReady.
  previewApp: (target?: PendingRoute) => void;
  pendingRoute: PendingRoute | null;
  clearPendingRoute: () => void;
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
  const [pendingRoute, setPendingRoute] = useState<PendingRoute | null>(null);

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
  const previewApp = useCallback((target?: PendingRoute) => {
    if (target) {
      setPendingRoute(target);
    }
    setHasEnteredApp(true);
  }, []);
  const clearPendingRoute = useCallback(() => setPendingRoute(null), []);
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
      pendingRoute,
      clearPendingRoute,
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
      pendingRoute,
      clearPendingRoute,
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
