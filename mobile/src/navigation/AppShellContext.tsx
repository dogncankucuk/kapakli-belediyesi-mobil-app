import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";

import { CurrentUser, getSessionUser, logout } from "../api/auth";
import { deletePushToken, registerPushToken } from "../api/notifications";
import {
  clearStoredPushToken,
  getStoredPushToken,
  requestPermissionsAndGetToken,
  setStoredPushToken,
} from "../services/pushNotifications";
import {
  getOnboardingGorulduMu,
  onboardingGorulduIsaretle,
} from "../storage/onboardingStorage";

function registerPushNotifications() {
  requestPermissionsAndGetToken()
    .then((token) => {
      if (!token) return;
      void setStoredPushToken(token);
      void registerPushToken(token, Platform.OS as "ios" | "android");
    })
    .catch(() => {});
}

export type PendingRoute = { screen: string; params?: object };

// App.tsx, AppShellProvider agacinin DISINDA render edildigi icin
// (bkz. navigation/index.tsx: Root() = AppShellProvider > AppShellGate)
// push bildirimi tiklamasi App.tsx'te useAppShell() hook'unu kullanamiyor.
// Bu modul-seviyesi referans, provider icindeki AYNI setPendingRoute state
// setter'ina disaridan erisim sagliyor - ayri bir pendingRoute mekanizmasi
// DEGIL, mevcut olanin disariya acilan kapisi.
let externalSetPendingRoute: ((route: PendingRoute) => void) | null = null;

export function setPendingRouteFromOutside(route: PendingRoute) {
  externalSetPendingRoute?.(route);
}

type AppShellContextValue = {
  hasEnteredApp: boolean;
  isCheckingSession: boolean;
  onboardingGorulduMu: boolean;
  onboardingiTamamla: () => void;
  user: CurrentUser | null;
  enterApp: (user: CurrentUser) => void;
  updateUser: (user: CurrentUser) => void;
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
  isCreateSheetOpen: boolean;
  openCreateSheet: () => void;
  closeCreateSheet: () => void;
};

const AppShellContext = createContext<AppShellContextValue | undefined>(
  undefined,
);

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<PendingRoute | null>(null);
  const [onboardingGorulduMu, setOnboardingGorulduMu] = useState(false);

  useEffect(() => {
    externalSetPendingRoute = setPendingRoute;
    return () => {
      externalSetPendingRoute = null;
    };
  }, []);

  useEffect(() => {
    Promise.all([
      getSessionUser().then((sessionUser) => {
        if (sessionUser) {
          setUser(sessionUser);
          setHasEnteredApp(true);
          registerPushNotifications();
        }
      }),
      getOnboardingGorulduMu().then(setOnboardingGorulduMu),
    ]).finally(() => setIsCheckingSession(false));
  }, []);

  const onboardingiTamamla = useCallback(() => {
    setOnboardingGorulduMu(true);
    void onboardingGorulduIsaretle();
  }, []);

  const enterApp = useCallback((sessionUser: CurrentUser) => {
    setUser(sessionUser);
    setHasEnteredApp(true);
    registerPushNotifications();
  }, []);
  const updateUser = useCallback((updatedUser: CurrentUser) => {
    setUser(updatedUser);
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
    void (async () => {
      // deletePushToken kendi icinde saklanan auth token'i okuyor - logout()
      // bu token'i temizlemeden ONCE cagrilmali, yoksa yetkisiz kalir.
      const pushToken = await getStoredPushToken();
      if (pushToken) {
        try {
          await deletePushToken(pushToken);
        } catch {
          // sunucuya ulasilamasa bile cikis akisini engellemeyelim
        }
        await clearStoredPushToken();
      }
      await logout();
    })();
  }, []);
  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const openCreateSheet = useCallback(() => setIsCreateSheetOpen(true), []);
  const closeCreateSheet = useCallback(() => setIsCreateSheetOpen(false), []);

  const value = useMemo(
    () => ({
      hasEnteredApp,
      isCheckingSession,
      onboardingGorulduMu,
      onboardingiTamamla,
      user,
      enterApp,
      updateUser,
      previewApp,
      pendingRoute,
      clearPendingRoute,
      exitApp,
      isMenuOpen,
      openMenu,
      closeMenu,
      isCreateSheetOpen,
      openCreateSheet,
      closeCreateSheet,
    }),
    [
      hasEnteredApp,
      isCheckingSession,
      onboardingGorulduMu,
      onboardingiTamamla,
      user,
      enterApp,
      updateUser,
      previewApp,
      pendingRoute,
      clearPendingRoute,
      exitApp,
      isMenuOpen,
      openMenu,
      closeMenu,
      isCreateSheetOpen,
      openCreateSheet,
      closeCreateSheet,
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
