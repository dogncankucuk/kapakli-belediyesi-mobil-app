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
import {
  CreateActionSheet,
  OnboardingCarousel,
  OnboardingSlide,
  YanMenuPanel,
} from "../components";
import { useTranslation } from "../i18n/LocaleContext";
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
  const {
    hasEnteredApp,
    isCheckingSession,
    onboardingGorulduMu,
    onboardingiTamamla,
    pendingRoute,
    clearPendingRoute,
  } = useAppShell();
  const { colors, mode } = useTheme();
  const { t } = useTranslation();

  const onboardingSlides: OnboardingSlide[] = useMemo(
    () => [
      {
        key: "belediye",
        icon: "account-balance",
        illustrationBg: colors.secondaryContainer,
        title: t("onboarding_slide1Title"),
        description: t("onboarding_slide1Description"),
      },
      {
        key: "atik",
        icon: "recycling",
        illustrationBg: colors.secondaryContainer,
        title: t("onboarding_slide2Title"),
        description: t("onboarding_slide2Description"),
      },
    ],
    [colors, t],
  );

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
      // pendingRoute.screen is a dynamic runtime string, not a literal from
      // the generated route union, so the static-navigation overload
      // resolution can't type this call - same reasoning as the `as never`
      // casts used at every other dynamic navigate() call site in this app.
      (navigationRef.navigate as (screen: string, params?: object) => void)(
        pendingRoute.screen,
        pendingRoute.params,
      );
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

  if (!onboardingGorulduMu) {
    return (
      <OnboardingCarousel
        slides={onboardingSlides}
        onDone={onboardingiTamamla}
      />
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
      <CreateActionSheet />
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
