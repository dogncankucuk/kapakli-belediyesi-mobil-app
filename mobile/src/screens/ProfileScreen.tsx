import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ComponentProps, useMemo } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { resolveMediaUrl } from "../api/client";
import { Card, HavaVeAramaSag, PrimaryButton, TopBar } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";
import { useAppShell } from "../navigation/AppShellContext";
import { Colors, spacing, Typography, useThemeColors, useTypography } from "../theme";

type MenuItem = {
  key: "HesapBilgilerim" | "Ayarlar";
  icon: ComponentProps<typeof MaterialIcons>["name"];
  labelKey: TranslationKey;
};

const MENU_ITEMS: MenuItem[] = [
  { key: "HesapBilgilerim", icon: "badge", labelKey: "profile_accountInfo" },
  { key: "Ayarlar", icon: "settings", labelKey: "profile_settings" },
];

function maskTcKimlikNo(tcKimlikNo: string | null): string | null {
  if (!tcKimlikNo) return null;
  if (tcKimlikNo.length !== 11) return tcKimlikNo;
  return `${tcKimlikNo.slice(0, 3)}*****${tcKimlikNo.slice(8)}`;
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { openMenu, user, exitApp } = useAppShell();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );

  const handleMenuPress = (item: MenuItem) => {
    if (item.key === "HesapBilgilerim" && !user) {
      Alert.alert(
        t("profile_loginRequiredTitle"),
        t("profile_loginRequiredMessage"),
      );
      return;
    }
    navigation.navigate(item.key as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar
        title={t("common_appName")}
        onMenuPress={openMenu}
        rightSlot={
          <HavaVeAramaSag
            onSearchPress={() =>
              (
                navigation.navigate as (
                  screen: string,
                  params?: object,
                ) => void
              )("Services", { screen: "ServicesMain", params: { acSearch: true } })
            }
          />
        }
      />
      <View style={styles.content}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            {user?.profilFotografiUrl ? (
              <Image
                source={{ uri: resolveMediaUrl(user.profilFotografiUrl) }}
                style={styles.avatarImage}
              />
            ) : (
              <MaterialIcons name="person" size={40} color={colors.onPrimary} />
            )}
          </View>
          {user ? (
            <>
              <Text style={styles.name}>
                {user.ad} {user.soyad}
              </Text>
              <Text style={styles.maskedInfo}>
                {maskTcKimlikNo(user.tcKimlikNo) ?? user.eposta}
              </Text>
            </>
          ) : (
            <Text style={styles.name}>{t("profile_notLoggedIn")}</Text>
          )}
        </View>

        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => {
            const requiresAuth = item.key === "HesapBilgilerim" && !user;
            return (
              <Pressable
                key={item.key}
                onPress={() => handleMenuPress(item)}
                accessibilityRole="button"
              >
                {({ pressed }) => (
                  <Card
                    style={[
                      styles.menuCard,
                      pressed && styles.menuCardPressed,
                      requiresAuth && styles.menuCardDisabled,
                    ]}
                  >
                    <MaterialIcons
                      name={requiresAuth ? "lock" : item.icon}
                      size={22}
                      color={requiresAuth ? colors.outline : colors.secondary}
                    />
                    <Text
                      style={[
                        styles.menuLabel,
                        requiresAuth && styles.menuLabelDisabled,
                      ]}
                    >
                      {t(item.labelKey)}
                    </Text>
                    <MaterialIcons
                      name="chevron-right"
                      size={22}
                      color={colors.outline}
                    />
                  </Card>
                )}
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton label={t("profile_logout")} onPress={exitApp} />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors, typography: Typography) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
    },
    identity: {
      alignItems: "center",
      gap: 4,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.stackGap / 2,
      overflow: "hidden",
    },
    avatarImage: {
      width: 72,
      height: 72,
    },
    name: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    maskedInfo: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    menu: {
      flex: 1,
      justifyContent: "center",
      gap: spacing.stackGap / 2,
    },
    menuCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
      minHeight: spacing.touchTargetMin,
      padding: spacing.stackGap,
    },
    menuCardPressed: {
      shadowOpacity: 0,
      elevation: 0,
    },
    menuCardDisabled: {
      opacity: 0.5,
    },
    menuLabel: {
      ...typography.labelLg,
      color: colors.onBackground,
      flex: 1,
    },
    menuLabelDisabled: {
      color: colors.outline,
    },
  });
