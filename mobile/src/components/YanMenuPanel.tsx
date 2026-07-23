import { MaterialIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppShell } from "../navigation/AppShellContext";
import { navigationRef } from "../navigation/navigationRef";
import { colors, shape, spacing, typography } from "../theme";

type MenuItem = {
  label: string;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  target?: { tab: "Map" | "Profile"; screen: string };
};

const MENU_ITEMS: MenuItem[] = [
  { label: "Kılavuz Rehberi", icon: "explore" },
  { label: "e-Belediye", icon: "account-balance" },
  { label: "Kent Rehberi", icon: "map" },
  {
    label: "Şehir Kameraları",
    icon: "videocam",
    target: { tab: "Map", screen: "SehirKameralari" },
  },
  {
    label: "Vefat Edenler",
    icon: "local-florist",
    target: { tab: "Profile", screen: "VefatEdenler" },
  },
  {
    label: "İletişim",
    icon: "call",
    target: { tab: "Profile", screen: "BizeUlasin" },
  },
  {
    label: "Ayarlar",
    icon: "settings",
    target: { tab: "Profile", screen: "Ayarlar" },
  },
];

export default function YanMenuPanel() {
  const { isMenuOpen, closeMenu } = useAppShell();

  const goTo = (target: MenuItem["target"]) => {
    closeMenu();
    if (target && navigationRef.isReady()) {
      navigationRef.navigate(target.tab, { screen: target.screen } as never);
    }
  };

  if (!isMenuOpen) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable
        style={styles.backdrop}
        onPress={closeMenu}
        accessibilityRole="button"
        accessibilityLabel="Menüyü kapat"
      />
      <SafeAreaView style={styles.panel} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kapaklı Belediyesi</Text>
          <Pressable
            onPress={closeMenu}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Menüyü kapat"
          >
            <MaterialIcons name="close" size={24} color={colors.onBackground} />
          </Pressable>
        </View>
        <View style={styles.items}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              style={styles.item}
              onPress={() => goTo(item.target)}
              accessibilityRole="button"
            >
              <MaterialIcons
                name={item.icon}
                size={22}
                color={colors.primaryContainer}
              />
              <Text style={styles.itemLabel}>{item.label}</Text>
            </Pressable>
          ))}
          <Pressable
            style={styles.item}
            onPress={closeMenu}
            accessibilityRole="button"
          >
            <MaterialIcons name="logout" size={22} color={colors.error} />
            <Text style={[styles.itemLabel, styles.exitLabel]}>Çıkış Yap</Text>
          </Pressable>
        </View>
        <Text style={styles.footer}>© 2026 Tüm Hakları Saklıdır</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.onBackground,
    opacity: 0.4,
  },
  panel: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "78%",
    maxWidth: 320,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.stackGap,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    ...typography.titleMd,
    color: colors.onBackground,
  },
  items: {
    gap: spacing.stackGap / 2,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.stackGap,
    minHeight: spacing.touchTargetMin,
    paddingHorizontal: spacing.stackGap / 2,
    borderRadius: shape.rounded,
  },
  itemLabel: {
    ...typography.bodyLg,
    color: colors.onBackground,
  },
  exitLabel: {
    color: colors.error,
  },
  footer: {
    ...typography.labelSm,
    color: colors.outline,
    textAlign: "center",
  },
});
