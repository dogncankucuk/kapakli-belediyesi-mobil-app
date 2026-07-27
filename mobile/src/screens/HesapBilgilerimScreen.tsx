import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { useAppShell } from "../navigation/AppShellContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

function maskTcKimlikNo(tcKimlikNo: string): string {
  if (tcKimlikNo.length !== 11) return tcKimlikNo;
  return `${tcKimlikNo.slice(0, 3)}*****${tcKimlikNo.slice(8)}`;
}

export default function HesapBilgilerimScreen() {
  const navigation = useNavigation();
  const { user } = useAppShell();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!user) {
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
          <Text style={styles.headerTitle}>{t("hesapBilgilerim_title")}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {t("hesapBilgilerim_loginRequired")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>{t("hesapBilgilerim_title")}</Text>
        <MaterialIcons name="search" size={22} color={colors.onBackground} />
      </View>

      <View style={styles.content}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={28} color={colors.onPrimary} />
          </View>
          <View>
            <Text style={styles.name}>
              {user.ad} {user.soyad}
            </Text>
            <Text style={styles.subtitle}>
              {t("hesapBilgilerim_tcNo")} {maskTcKimlikNo(user.tcKimlikNo)}
            </Text>
          </View>
        </View>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="badge" size={18} color={colors.secondary} />
            <Text style={styles.cardTitle}>
              {t("hesapBilgilerim_personalInfo")}
            </Text>
          </View>
          <View style={styles.fieldRow}>
            <View style={styles.field}>
              <Text style={styles.label}>{t("hesapBilgilerim_ad")}</Text>
              <TextInput
                style={styles.input}
                value={user.ad}
                editable={false}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t("hesapBilgilerim_soyad")}</Text>
              <TextInput
                style={styles.input}
                value={user.soyad}
                editable={false}
              />
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="call" size={18} color={colors.secondary} />
            <Text style={styles.cardTitle}>
              {t("hesapBilgilerim_contactInfo")}
            </Text>
          </View>
          <View style={styles.fieldRow}>
            <View style={styles.field}>
              <Text style={styles.label}>{t("hesapBilgilerim_telefon")}</Text>
              <TextInput
                style={styles.input}
                value={user.telefon}
                editable={false}
              />
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="lock" size={18} color={colors.secondary} />
            <Text style={styles.cardTitle}>
              {t("hesapBilgilerim_security")}
            </Text>
          </View>
          <Pressable style={styles.securityRow} accessibilityRole="button">
            <MaterialIcons
              name="vpn-key"
              size={18}
              color={colors.onBackground}
            />
            <Text style={styles.securityLabel}>
              {t("hesapBilgilerim_changePassword")}
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={18}
              color={colors.outline}
            />
          </Pressable>
        </Card>
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
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.containerMargin,
    },
    emptyText: {
      ...typography.bodyLg,
      color: colors.outline,
      textAlign: "center",
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
      gap: spacing.stackGap,
    },
    identity: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    name: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    subtitle: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    card: {
      padding: spacing.stackGap,
      gap: spacing.stackGap / 2,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
    },
    cardTitle: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    fieldRow: {
      flexDirection: "row",
      gap: spacing.stackGap / 2,
    },
    field: {
      flex: 1,
      gap: 4,
    },
    label: {
      ...typography.labelSm,
      color: colors.outline,
    },
    input: {
      ...typography.bodyMd,
      minHeight: spacing.touchTargetMin - 8,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: shape.rounded,
      paddingHorizontal: spacing.stackGap / 2,
      color: colors.onBackground,
      backgroundColor: colors.background,
    },
    securityRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
      minHeight: spacing.touchTargetMin - 8,
    },
    securityLabel: {
      ...typography.bodyMd,
      color: colors.onBackground,
      flex: 1,
    },
  });
