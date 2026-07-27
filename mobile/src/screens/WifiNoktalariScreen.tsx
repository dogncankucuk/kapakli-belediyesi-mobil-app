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

import { getUcretsizWifiNoktalari } from "../api/wifiHizmeti";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

export default function WifiNoktalariScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [noktalar, setNoktalar] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getUcretsizWifiNoktalari()
      .then(setNoktalar)
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
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("wifi_title")}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.summary}>
          <MaterialIcons name="wifi" size={28} color={colors.secondary} />
          <Text style={styles.summaryText}>
            {t("wifi_summary").replace("{count}", String(noktalar.length))}
          </Text>
        </View>

        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("wifi_error")}</Text>
        )}
        {!isLoading && !error && noktalar.length === 0 && (
          <Text style={styles.emptyText}>{t("wifi_empty")}</Text>
        )}

        {!isLoading && !error && (
          <View style={styles.list}>
            {noktalar.map((nokta, index) => (
              <Card key={index} style={styles.card}>
                <View style={styles.icon}>
                  <MaterialIcons
                    name="wifi"
                    size={20}
                    color={colors.onPrimary}
                  />
                </View>
                <Text style={styles.name}>{nokta}</Text>
              </Card>
            ))}
          </View>
        )}
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
    backButton: {
      width: spacing.touchTargetMin,
      height: spacing.touchTargetMin,
      marginLeft: -spacing.stackGap,
      alignItems: "center",
      justifyContent: "center",
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
    summary: {
      height: 72,
      borderRadius: shape.rounded,
      backgroundColor: colors.outlineVariant,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.stackGap / 2,
    },
    summaryText: {
      ...typography.labelLg,
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
    list: {
      gap: spacing.stackGap / 2,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
      padding: spacing.stackGap,
    },
    icon: {
      width: 36,
      height: 36,
      borderRadius: shape.rounded,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    name: {
      ...typography.labelLg,
      color: colors.onBackground,
      flex: 1,
    },
  });
