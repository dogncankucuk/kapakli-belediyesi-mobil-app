import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getTeskiSuKesintileri, TeskiSuKesintisi } from "../api/suKesintileri";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, spacing, typography, useThemeColors } from "../theme";

export default function SuHizmetleriScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [kesintiler, setKesintiler] = useState<TeskiSuKesintisi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getTeskiSuKesintileri()
      .then(setKesintiler)
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
          <MaterialIcons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("suHizmetleri_title")}</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{t("suHizmetleri_cardTitle")}</Text>

          {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
          {!isLoading && error && (
            <Text style={styles.errorText}>{t("suHizmetleri_error")}</Text>
          )}
          {!isLoading && !error && kesintiler.length === 0 && (
            <Text style={styles.emptyText}>{t("suHizmetleri_empty")}</Text>
          )}
          {!isLoading &&
            !error &&
            kesintiler.map((kesinti, index) => (
              <View key={index} style={styles.kesintiRow}>
                <Text style={styles.kesintiTarih}>
                  {kesinti.baslangic} - {kesinti.bitis}
                </Text>
                <Text style={styles.kesintiNedeni}>{kesinti.nedeni}</Text>
                <Text style={styles.kesintiYer}>{kesinti.yer}</Text>
              </View>
            ))}
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
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
      paddingHorizontal: spacing.containerMargin,
      paddingVertical: spacing.stackGap,
      backgroundColor: colors.primaryContainer,
    },
    headerTitle: {
      ...typography.titleLg,
      color: colors.onPrimary,
    },
    content: {
      flex: 1,
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
    },
    card: {
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
    },
    cardTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
    },
    emptyText: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    kesintiRow: {
      gap: 2,
      paddingVertical: spacing.stackGap / 2,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
    },
    kesintiTarih: {
      ...typography.labelLg,
      color: colors.secondary,
    },
    kesintiNedeni: {
      ...typography.bodyMd,
      color: colors.onBackground,
      fontWeight: "600",
    },
    kesintiYer: {
      ...typography.bodyMd,
      color: colors.outline,
    },
  });
