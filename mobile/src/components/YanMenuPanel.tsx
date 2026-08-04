import { MaterialIcons } from "@expo/vector-icons";
import { ComponentProps, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getHavaDurumu } from "../api/havaDurumu";
import { HavaDurumu } from "../api/types";
import { havaDurumuIkonu } from "../constants/havaDurumu";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";
import { useAppShell } from "../navigation/AppShellContext";
import { navigationRef } from "../navigation/navigationRef";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

type MenuItem = {
  labelKey: TranslationKey;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  target?: {
    screen: string;
  };
};

const MENU_ITEMS: MenuItem[] = [
  {
    labelKey: "baskan_title",
    icon: "groups",
    target: { screen: "Baskan" },
  },
  {
    labelKey: "profile_about",
    icon: "info",
    target: { screen: "Hakkimizda" },
  },
  {
    labelKey: "profile_helpCenter",
    icon: "help",
    target: { screen: "YardimMerkezi" },
  },
  {
    labelKey: "profile_contactUs",
    icon: "call",
    target: { screen: "BizeUlasin" },
  },
  {
    labelKey: "yanMenu_settings",
    icon: "settings",
    target: { screen: "Ayarlar" },
  },
];

export default function YanMenuPanel() {
  const { isMenuOpen, closeMenu, exitApp } = useAppShell();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [havaDurumu, setHavaDurumu] = useState<HavaDurumu | null>(null);

  useEffect(() => {
    getHavaDurumu()
      .then(setHavaDurumu)
      .catch(() => {
        // Yan menu widget'i icin sessiz basarisizlik kabul edilebilir.
      });
  }, []);

  const goTo = (target: MenuItem["target"]) => {
    closeMenu();
    if (target && navigationRef.isReady()) {
      navigationRef.navigate(target.screen as never);
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
          <Pressable
            onPress={closeMenu}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Menüyü kapat"
            style={styles.closeButton}
          >
            <MaterialIcons name="close" size={24} color={colors.onBackground} />
          </Pressable>
          <View style={styles.logoCircle}>
            <MaterialIcons
              name="account-balance"
              size={28}
              color={colors.onPrimary}
            />
          </View>
          <Text style={styles.headerTitle}>{t("common_appName")}</Text>
          {havaDurumu && (
            <View style={styles.weatherRow}>
              <MaterialIcons
                name={havaDurumuIkonu(havaDurumu.durumKodu)}
                size={16}
                color={colors.secondary}
              />
              <Text style={styles.weatherText}>
                {Math.round(havaDurumu.sicaklik)}°C · {havaDurumu.durumAdi}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.items}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.labelKey}
              style={styles.item}
              onPress={() => goTo(item.target)}
              accessibilityRole="button"
            >
              <MaterialIcons
                name={item.icon}
                size={22}
                color={colors.primaryContainer}
              />
              <Text style={styles.itemLabel}>{t(item.labelKey)}</Text>
            </Pressable>
          ))}
          <Pressable
            style={styles.item}
            onPress={() => {
              closeMenu();
              exitApp();
            }}
            accessibilityRole="button"
          >
            <MaterialIcons name="logout" size={22} color={colors.error} />
            <Text style={[styles.itemLabel, styles.exitLabel]}>
              {t("yanMenu_logout")}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.footer}>{t("yanMenu_footer")}</Text>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
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
      alignItems: "center",
      gap: 4,
      paddingTop: spacing.stackGap / 2,
    },
    closeButton: {
      position: "absolute",
      top: 0,
      right: 0,
      padding: 4,
    },
    logoCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    headerTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
      textAlign: "center",
    },
    weatherRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    weatherText: {
      ...typography.labelSm,
      color: colors.outline,
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
