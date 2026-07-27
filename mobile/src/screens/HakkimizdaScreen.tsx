import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getKapakliTarihcesi, KapakliTarihcesi } from "../api/kapakliTarihcesi";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

export default function HakkimizdaScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [tarihce, setTarihce] = useState<KapakliTarihcesi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getKapakliTarihcesi()
      .then(setTarihce)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

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
        <Text style={styles.headerTitle}>{t("common_appName")}</Text>
        <MaterialIcons name="search" size={22} color={colors.onBackground} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <MaterialIcons
            name="account-balance"
            size={28}
            color={colors.onPrimary}
          />
          <Text style={styles.heroTitle}>{t("hakkimizda_title")}</Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate("Baskan" as never)}
          accessibilityRole="button"
        >
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="groups" size={18} color={colors.secondary} />
              <Text style={styles.cardTitle}>{t("hakkimizda_mayorTitle")}</Text>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={colors.outline}
              />
            </View>
            <Text style={styles.paragraph}>{t("hakkimizda_mayorBio")}</Text>
          </Card>
        </Pressable>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons
              name="history-edu"
              size={18}
              color={colors.secondary}
            />
            <Text style={styles.cardTitle}>{t("hakkimizda_historyTitle")}</Text>
          </View>
          {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
          {!isLoading && (error || !tarihce) && (
            <Text style={styles.errorText}>{t("hakkimizda_historyError")}</Text>
          )}
          {!isLoading &&
            tarihce &&
            tarihce.paragraflar.map((paragraf, index) => (
              <Text key={index} style={styles.paragraph}>
                {paragraf}
              </Text>
            ))}
        </Card>

        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>1986</Text>
            <Text style={styles.statLabel}>{t("hakkimizda_stat1986")}</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>2012</Text>
            <Text style={styles.statLabel}>{t("hakkimizda_stat2012")}</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>147.610</Text>
            <Text style={styles.statLabel}>
              {t("hakkimizda_statPopulation")}
            </Text>
          </View>
        </View>
      </ScrollView>
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
      paddingHorizontal: spacing.containerMargin,
      paddingBottom: spacing.stackGap,
      gap: spacing.stackGap,
    },
    hero: {
      minHeight: 96,
      borderRadius: shape.rounded,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    heroTitle: {
      ...typography.titleLg,
      color: colors.onPrimary,
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
      flex: 1,
    },
    paragraph: {
      ...typography.bodyMd,
      color: colors.onBackground,
      lineHeight: 22,
    },
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
    },
    statsRow: {
      flexDirection: "row",
      gap: spacing.stackGap / 2,
    },
    statBadge: {
      flex: 1,
      minHeight: spacing.touchTargetMin,
      borderRadius: shape.rounded,
      backgroundColor: colors.secondaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    statValue: {
      ...typography.titleMd,
      color: colors.primaryContainer,
    },
    statLabel: {
      ...typography.labelSm,
      color: colors.primaryContainer,
    },
  });
