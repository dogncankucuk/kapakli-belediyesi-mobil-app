import {
  createStaticNavigation,
  DefaultTheme,
  NavigationContainerRef,
  ParamListBase,
  StaticParamList,
} from "@react-navigation/native";
import { Ref, useCallback, useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AppShellProvider, useAppShell } from "./AppShellContext";
import { navigationRef } from "./navigationRef";
import RootStack from "./RootStack";
import { YanMenuPanel } from "../components";
import GirisEkraniScreen from "../screens/GirisEkraniScreen";
import { useTheme } from "../theme/ThemeContext";

const Navigation = createStaticNavigation(RootStack);

type RootStackParamList = StaticParamList<typeof RootStack>;
declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}

function AppShellGate() {
  const { hasEnteredApp, isCheckingSession, pendingRoute, clearPendingRoute } =
    useAppShell();
  const { colors, mode } = useTheme();

  const navTheme = useMemo(
    () => ({
      ...DefaultTheme,
      dark: mode === "dark",
      colors: {
        primary: colors.primaryContainer,
        background: colors.background,
        card: colors.surfaceContainerLowest,
        text: colors.onBackground,
        border: colors.outlineVariant,
        notification: colors.error,
      },
    }),
    [colors, mode],
  );

  const handleNavigationReady = useCallback(() => {
    if (pendingRoute && navigationRef.isReady()) {
      navigationRef.navigate("Tabs", {
        screen: pendingRoute.tab,
        params: { screen: pendingRoute.screen },
      } as never);
      clearPendingRoute();
    }
  }, [pendingRoute, clearPendingRoute]);

  if (isCheckingSession) {
    return (
      <View
        style={[
          styles.root,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primaryContainer} />
      </View>
    );
  }

  if (!hasEnteredApp) {
    return <GirisEkraniScreen />;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* createStaticNavigation's ref type is fixed to the generic ParamListBase,
          while createNavigationContainerRef() infers our augmented RootParamList —
          the two are structurally incompatible for TS even though they match at runtime. */}
      <Navigation
        ref={
          navigationRef as unknown as Ref<NavigationContainerRef<ParamListBase>>
        }
        theme={navTheme}
        onReady={handleNavigationReady}
      />
      <YanMenuPanel />
    </View>
  );
}

export default function Root() {
  return (
    <AppShellProvider>
      <AppShellGate />
    </AppShellProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
});
