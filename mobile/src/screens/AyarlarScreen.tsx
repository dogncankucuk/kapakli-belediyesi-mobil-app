import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { useAppShell } from "../navigation/AppShellContext";
import { Colors, shape, spacing, typography, useTheme } from "../theme";

export default function AyarlarScreen() {
  const navigation = useNavigation();
  const { exitApp } = useAppShell();
  const { locale, setLocale, t } = useTranslation();
  const { mode, setMode, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("common_back")}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.onBackground}
          />
        </Pressable>
        <Text style={styles.headerTitle}>{t("ayarlar_title")}</Text>
        <MaterialIcons name="search" size={22} color={colors.onBackground} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("ayarlar_languageSection")}
          </Text>
          <View style={styles.optionRow}>
            <Pressable
              style={styles.optionItem}
              onPress={() => setLocale("tr")}
              accessibilityRole="button"
            >
              <Card style={styles.optionCard}>
                <MaterialIcons
                  name="public"
                  size={18}
                  color={colors.secondary}
                />
                <Text style={styles.optionLabel}>{t("ayarlar_turkish")}</Text>
                <MaterialIcons
                  name={
                    locale === "tr"
                      ? "radio-button-checked"
                      : "radio-button-unchecked"
                  }
                  size={18}
                  color={locale === "tr" ? colors.secondary : colors.outline}
                />
              </Card>
            </Pressable>
            <Pressable
              style={styles.optionItem}
              onPress={() => setLocale("en")}
              accessibilityRole="button"
            >
              <Card style={styles.optionCard}>
                <MaterialIcons
                  name="translate"
                  size={18}
                  color={colors.secondary}
                />
                <Text style={styles.optionLabel}>{t("ayarlar_english")}</Text>
                <MaterialIcons
                  name={
                    locale === "en"
                      ? "radio-button-checked"
                      : "radio-button-unchecked"
                  }
                  size={18}
                  color={locale === "en" ? colors.secondary : colors.outline}
                />
              </Card>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("ayarlar_themeSection")}</Text>
          <View style={styles.themeRow}>
            <Pressable
              style={styles.themeItem}
              onPress={() => setMode("light")}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.themeCard,
                  mode === "light" && styles.themeCardActive,
                ]}
              >
                <MaterialIcons
                  name="wb-sunny"
                  size={20}
                  color={
                    mode === "light" ? colors.onSecondary : colors.onBackground
                  }
                />
                <Text
                  style={[
                    styles.themeLabel,
                    mode === "light" && styles.themeLabelActive,
                  ]}
                >
                  {t("ayarlar_lightMode")}
                </Text>
              </View>
            </Pressable>
            <Pressable
              style={styles.themeItem}
              onPress={() => setMode("dark")}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.themeCard,
                  mode === "dark" && styles.themeCardActive,
                ]}
              >
                <MaterialIcons
                  name="nightlight"
                  size={20}
                  color={
                    mode === "dark" ? colors.onSecondary : colors.onBackground
                  }
                />
                <Text
                  style={[
                    styles.themeLabel,
                    mode === "dark" && styles.themeLabelActive,
                  ]}
                >
                  {t("ayarlar_darkMode")}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("ayarlar_notificationsSection")}
          </Text>
          <Card style={styles.notificationCard}>
            <View style={styles.notificationText}>
              <Text style={styles.optionLabel}>
                {t("ayarlar_pushNotifications")}
              </Text>
              <Text style={styles.notificationSubtitle}>
                {t("ayarlar_pushNotificationsSubtitle")}
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{
                false: colors.outlineVariant,
                true: colors.secondaryContainer,
              }}
              thumbColor={colors.secondary}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("ayarlar_supportSection")}</Text>
          <Pressable accessibilityRole="button">
            <Card style={styles.linkCard}>
              <MaterialIcons
                name="privacy-tip"
                size={18}
                color={colors.secondary}
              />
              <Text style={styles.optionLabel}>
                {t("ayarlar_privacyPolicy")}
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={18}
                color={colors.outline}
              />
            </Card>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("YardimMerkezi" as never)}
            accessibilityRole="button"
          >
            <Card style={styles.linkCard}>
              <MaterialIcons name="help" size={18} color={colors.secondary} />
              <Text style={styles.optionLabel}>{t("ayarlar_helpCenter")}</Text>
              <MaterialIcons
                name="chevron-right"
                size={18}
                color={colors.outline}
              />
            </Card>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          style={styles.logoutButton}
          onPress={exitApp}
        >
          <MaterialIcons name="logout" size={18} color={colors.error} />
          <Text style={styles.logoutLabel}>{t("ayarlar_logout")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.containerMargin,
      paddingVertical: spacing.stackGap,
    },
    headerTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.containerMargin,
      paddingBottom: spacing.stackGap,
      justifyContent: "space-between",
    },
    section: {
      gap: spacing.stackGap / 2,
    },
    sectionTitle: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    optionRow: {
      flexDirection: "row",
      gap: spacing.stackGap / 2,
    },
    optionItem: {
      flex: 1,
    },
    optionCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
      padding: spacing.stackGap / 2,
    },
    optionLabel: {
      ...typography.bodyMd,
      color: colors.onBackground,
      flex: 1,
    },
    themeRow: {
      flexDirection: "row",
      gap: spacing.stackGap / 2,
    },
    themeItem: {
      flex: 1,
    },
    themeCard: {
      minHeight: spacing.touchTargetMin,
      borderRadius: shape.rounded,
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    themeCardActive: {
      backgroundColor: colors.secondary,
      borderColor: colors.secondary,
    },
    themeLabel: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    themeLabelActive: {
      color: colors.onSecondary,
    },
    notificationCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.stackGap / 2,
    },
    notificationText: {
      flex: 1,
    },
    notificationSubtitle: {
      ...typography.labelSm,
      color: colors.outline,
    },
    linkCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
      padding: spacing.stackGap / 2,
      marginBottom: 6,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.stackGap / 2,
      minHeight: spacing.touchTargetMin,
      borderRadius: shape.rounded,
      backgroundColor: colors.errorContainer,
    },
    logoutLabel: {
      ...typography.labelLg,
      color: colors.error,
    },
  });
