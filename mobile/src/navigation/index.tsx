import {
  createStaticNavigation,
  NavigationContainerRef,
  ParamListBase,
  StaticParamList,
} from "@react-navigation/native";
import { Ref } from "react";
import { StyleSheet, View } from "react-native";

import { AppShellProvider, useAppShell } from "./AppShellContext";
import { navigationRef } from "./navigationRef";
import RootTabs from "./RootTabs";
import { YanMenuPanel } from "../components";
import GirisEkraniScreen from "../screens/GirisEkraniScreen";

const Navigation = createStaticNavigation(RootTabs);

type RootStackParamList = StaticParamList<typeof RootTabs>;
declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}

function AppShellGate() {
  const { hasEnteredApp } = useAppShell();

  if (!hasEnteredApp) {
    return <GirisEkraniScreen />;
  }

  return (
    <View style={styles.root}>
      {/* createStaticNavigation's ref type is fixed to the generic ParamListBase,
          while createNavigationContainerRef() infers our augmented RootParamList —
          the two are structurally incompatible for TS even though they match at runtime. */}
      <Navigation
        ref={
          navigationRef as unknown as Ref<NavigationContainerRef<ParamListBase>>
        }
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
});
