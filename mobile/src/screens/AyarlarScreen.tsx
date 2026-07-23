import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../components";
import { colors, shape, spacing, typography } from "../theme";

export default function AyarlarScreen() {
  const navigation = useNavigation();
  const [language, setLanguage] = useState<"tr" | "en">("tr");
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Geri dön"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.onBackground}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <MaterialIcons name="search" size={22} color={colors.onBackground} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dil Seçimi</Text>
          <View style={styles.optionRow}>
            <Pressable
              style={styles.optionItem}
              onPress={() => setLanguage("tr")}
              accessibilityRole="button"
            >
              <Card style={styles.optionCard}>
                <MaterialIcons
                  name="public"
                  size={18}
                  color={colors.secondary}
                />
                <Text style={styles.optionLabel}>Türkçe</Text>
                <MaterialIcons
                  name={
                    language === "tr"
                      ? "radio-button-checked"
                      : "radio-button-unchecked"
                  }
                  size={18}
                  color={language === "tr" ? colors.secondary : colors.outline}
                />
              </Card>
            </Pressable>
            <Pressable
              style={styles.optionItem}
              onPress={() => setLanguage("en")}
              accessibilityRole="button"
            >
              <Card style={styles.optionCard}>
                <MaterialIcons
                  name="translate"
                  size={18}
                  color={colors.secondary}
                />
                <Text style={styles.optionLabel}>English</Text>
                <MaterialIcons
                  name={
                    language === "en"
                      ? "radio-button-checked"
                      : "radio-button-unchecked"
                  }
                  size={18}
                  color={language === "en" ? colors.secondary : colors.outline}
                />
              </Card>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tema Tercihi</Text>
          <View style={styles.themeRow}>
            <Pressable
              style={styles.themeItem}
              onPress={() => setDarkMode(false)}
              accessibilityRole="button"
            >
              <View
                style={[styles.themeCard, !darkMode && styles.themeCardActive]}
              >
                <MaterialIcons
                  name="wb-sunny"
                  size={20}
                  color={!darkMode ? colors.onSecondary : colors.onBackground}
                />
                <Text
                  style={[
                    styles.themeLabel,
                    !darkMode && styles.themeLabelActive,
                  ]}
                >
                  Açık Mod
                </Text>
              </View>
            </Pressable>
            <Pressable
              style={styles.themeItem}
              onPress={() => setDarkMode(true)}
              accessibilityRole="button"
            >
              <View
                style={[styles.themeCard, darkMode && styles.themeCardActive]}
              >
                <MaterialIcons
                  name="nightlight"
                  size={20}
                  color={darkMode ? colors.onSecondary : colors.onBackground}
                />
                <Text
                  style={[
                    styles.themeLabel,
                    darkMode && styles.themeLabelActive,
                  ]}
                >
                  Koyu Mod
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirimler</Text>
          <Card style={styles.notificationCard}>
            <View style={styles.notificationText}>
              <Text style={styles.optionLabel}>Anlık Bildirimler</Text>
              <Text style={styles.notificationSubtitle}>
                Duyuru ve haber bildirimleri
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
          <Text style={styles.sectionTitle}>Destek ve Bilgi</Text>
          <Pressable accessibilityRole="button">
            <Card style={styles.linkCard}>
              <MaterialIcons
                name="privacy-tip"
                size={18}
                color={colors.secondary}
              />
              <Text style={styles.optionLabel}>Gizlilik Politikası</Text>
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
              <Text style={styles.optionLabel}>Yardım Merkezi</Text>
              <MaterialIcons
                name="chevron-right"
                size={18}
                color={colors.outline}
              />
            </Card>
          </Pressable>
        </View>

        <Pressable accessibilityRole="button" style={styles.logoutButton}>
          <MaterialIcons name="logout" size={18} color={colors.error} />
          <Text style={styles.logoutLabel}>Oturumu Kapat</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
