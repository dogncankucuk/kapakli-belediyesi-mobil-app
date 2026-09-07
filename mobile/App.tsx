import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LocaleProvider } from "./src/i18n/LocaleContext";
import Navigation from "./src/navigation";
import { setPendingRouteFromOutside } from "./src/navigation/AppShellContext";
import { navigationRef } from "./src/navigation/navigationRef";
import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const ILISKILI_TIP_EKRANI: Record<string, string> = {
  kaziCalismasi: "KaziDetay",
  suKesintisi: "SuKesintisiDetay",
  elektrikKesintisi: "ElektrikKesintisiDetay",
};

function bildirimTiklamasiniIsle(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data as {
    iliskiliTip?: string;
    iliskiliId?: string;
  };
  const screen = data.iliskiliTip
    ? ILISKILI_TIP_EKRANI[data.iliskiliTip]
    : undefined;
  if (!screen || !data.iliskiliId) return;

  const route = { screen, params: { id: data.iliskiliId } };
  if (navigationRef.isReady()) {
    (navigationRef.navigate as (screen: string, params?: object) => void)(
      route.screen,
      route.params,
    );
  } else {
    // Navigation henuz mount olmadi (ör. soguk baslangic) - AppShellContext'teki
    // pendingRoute state'ine yaziyoruz, o da onReady'de tuketiyor.
    setPendingRouteFromOutside(route);
  }
}

function ThemedStatusBar() {
  const { mode } = useTheme();
  return <StatusBar style={mode === "dark" ? "light" : "dark"} />;
}

export default function App() {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      bildirimTiklamasiniIsle,
    );
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) bildirimTiklamasiniIsle(response);
    });
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocaleProvider>
          <Navigation />
          <ThemedStatusBar />
        </LocaleProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
