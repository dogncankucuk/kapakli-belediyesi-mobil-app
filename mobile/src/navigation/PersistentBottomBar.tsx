import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { navigationRef } from "./navigationRef";
import { FabTabButton, TAB_ITEMS, TabLabel } from "./RootTabs";
import { Colors, useThemeColors } from "../theme";

type TabName = (typeof TAB_ITEMS)[number]["name"];

// RootStack, geri tusu gercek onceki ekrana donsun diye Harita/Ayarlar/Randevu Al
// gibi ~28 ekrani Tabs'in DISINDA, kok stack'te tutuyor (bkz. RootStack.tsx yorumu).
// Bu yuzden o ekranlarda hangi sekmenin "aktif" sayilacagina dair anlamli bir
// karsilik yok - boyle bir ekrandayken hicbir sekme vurgulanmaz, sadece Tabs
// icindeyken (Home/Hava/Services/Profile) o sekme aktif renkte gosterilir.
function getActiveTabName(): TabName | null {
  if (!navigationRef.isReady()) return null;
  const rootState = navigationRef.getRootState();
  const tabsRoute = rootState?.routes.find((route) => route.name === "Tabs");
  const tabsState = tabsRoute?.state as
    | { routes: { name: string }[]; index: number }
    | undefined;
  const focused = tabsState ? tabsState.routes[tabsState.index]?.name : null;
  return TAB_ITEMS.some((item) => item.name === focused)
    ? (focused as TabName)
    : null;
}

function PersistentBottomBar() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(colors, insets.bottom),
    [colors, insets.bottom],
  );
  const [activeTab, setActiveTab] = useState<TabName | null>(
    getActiveTabName(),
  );

  useEffect(() => {
    return navigationRef.addListener("state", () => {
      setActiveTab(getActiveTabName());
    });
  }, []);

  function goToTab(name: TabName) {
    if (!navigationRef.isReady()) return;
    // Dinamik ekran adiyla navigate - static navigation'in tip cikarimi bunu
    // literal olarak bilemiyor, projedeki diger dinamik navigate cagrilariyla
    // ayni cast deseni (bkz. navigation/index.tsx handleNavigationReady).
    const navigate = navigationRef.navigate as (
      screen: string,
      params?: object,
    ) => void;
    if (name === "Profile") {
      navigate("Tabs", { screen: "Profile", params: { screen: "ProfileMain" } });
    } else {
      navigate("Tabs", { screen: name });
    }
  }

  const [ilkIkiSekme, sonIkiSekme] = [TAB_ITEMS.slice(0, 2), TAB_ITEMS.slice(2)];

  return (
    <View style={styles.bar}>
      {ilkIkiSekme.map((item) => (
        <TabButton
          key={item.name}
          item={item}
          active={activeTab === item.name}
          colors={colors}
          onPress={() => goToTab(item.name)}
        />
      ))}
      <FabTabButton />
      {sonIkiSekme.map((item) => (
        <TabButton
          key={item.name}
          item={item}
          active={activeTab === item.name}
          colors={colors}
          onPress={() => goToTab(item.name)}
        />
      ))}
    </View>
  );
}

function TabButton({
  item,
  active,
  colors,
  onPress,
}: {
  item: (typeof TAB_ITEMS)[number];
  active: boolean;
  colors: Colors;
  onPress: () => void;
}) {
  const color = active ? colors.primary : colors.outline;
  return (
    <Pressable
      style={styles.tabButton}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.name}
    >
      <MaterialIcons name={item.icon} size={24} color={color} />
      <TabLabel tKey={item.labelKey} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingTop: 6,
  },
});

const createStyles = (colors: Colors, bottomInset: number) =>
  StyleSheet.create({
    bar: {
      flexDirection: "row",
      backgroundColor: colors.surfaceContainerLowest,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
      paddingBottom: bottomInset,
    },
  });

export default PersistentBottomBar;
