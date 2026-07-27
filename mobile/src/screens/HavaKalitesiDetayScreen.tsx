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

import { getHavaKalitesi } from "../api/havaKalitesi";
import { HavaKalitesi } from "../api/types";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, spacing, typography, useThemeColors } from "../theme";

function formatSaat(iso: string): string {
  return new Date(iso).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HavaKalitesiDetayScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [veri, setVeri] = useState<HavaKalitesi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getHavaKalitesi()
      .then(setVeri)
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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t("havaKalitesi_title")}
        </Text>
      </View>
      <View style={styles.content}>
        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("havaKalitesi_error")}</Text>
        )}

        {!isLoading && !error && veri && (
          <>
            <Card style={styles.gaugeCard}>
              <View style={[styles.gauge, { borderColor: veri.durum.renk }]}>
                <Text style={styles.gaugeValue}>{veri.aqi}</Text>
                <View style={styles.gaugeLabelRow}>
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    color={veri.durum.renk}
                  />
                  <Text style={[styles.gaugeLabel, { color: veri.durum.renk }]}>
                    {veri.durum.ad}
                  </Text>
                </View>
              </View>
              <Text style={styles.gaugeDescription}>{veri.durum.aciklama}</Text>
              <Text style={styles.stationText}>
                {veri.istasyonAdi} · {formatSaat(veri.olcumZamani)} ·{" "}
                {t("havaKalitesi_dominantPollutant")} {veri.baskinKirletici}
              </Text>
            </Card>
            <View style={styles.metricsRow}>
              <Card style={styles.metricCard}>
                <Text style={styles.metricLabel}>PM2.5</Text>
                <Text style={styles.metricValue}>
                  {veri.kirleticiler.pm25?.toFixed(1) ?? "-"}
                </Text>
                <Text style={styles.metricUnit}>µg/m³</Text>
              </Card>
              <Card style={styles.metricCard}>
                <Text style={styles.metricLabel}>PM10</Text>
                <Text style={styles.metricValue}>
                  {veri.kirleticiler.pm10?.toFixed(1) ?? "-"}
                </Text>
                <Text style={styles.metricUnit}>µg/m³</Text>
              </Card>
              <Card style={styles.metricCard}>
                <Text style={styles.metricLabel}>NO2</Text>
                <Text style={styles.metricValue}>
                  {veri.kirleticiler.no2?.toFixed(1) ?? "-"}
                </Text>
                <Text style={styles.metricUnit}>µg/m³</Text>
              </Card>
            </View>
            <Card style={styles.tipCard}>
              <View style={styles.tipHeaderRow}>
                <MaterialIcons name="info" size={18} color={colors.onPrimary} />
                <Text style={styles.tipHeader}>
                  {t("havaKalitesi_healthTips")}
                </Text>
              </View>
              <Text style={styles.tipText}>{veri.durum.aciklama}</Text>
            </Card>
            <Text style={styles.sourceText}>{t("havaKalitesi_source")}</Text>
          </>
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
      flexShrink: 1,
    },
    content: {
      flex: 1,
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
    },
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
    },
    gaugeCard: {
      alignItems: "center",
      gap: spacing.stackGap / 2,
      padding: spacing.containerMargin,
    },
    gauge: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 6,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    },
    gaugeValue: {
      ...typography.headlineMdMobile,
      color: colors.onBackground,
    },
    gaugeLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    gaugeLabel: {
      ...typography.labelSm,
    },
    gaugeDescription: {
      ...typography.bodyMd,
      color: colors.outline,
      textAlign: "center",
    },
    stationText: {
      ...typography.labelSm,
      color: colors.outline,
      textAlign: "center",
    },
    metricsRow: {
      flexDirection: "row",
      gap: spacing.gridGutter,
    },
    metricCard: {
      flex: 1,
      alignItems: "center",
      gap: 2,
      padding: spacing.stackGap,
    },
    metricLabel: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    metricValue: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    metricUnit: {
      ...typography.labelSm,
      color: colors.outline,
    },
    tipCard: {
      backgroundColor: colors.primaryContainer,
      padding: spacing.stackGap,
      gap: 4,
    },
    tipHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    tipHeader: {
      ...typography.labelLg,
      color: colors.onPrimary,
    },
    tipText: {
      ...typography.bodyMd,
      color: colors.onPrimaryContainer,
    },
    sourceText: {
      ...typography.labelSm,
      color: colors.outline,
      textAlign: "center",
    },
  });
