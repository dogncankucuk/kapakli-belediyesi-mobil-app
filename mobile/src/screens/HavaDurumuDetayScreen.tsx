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

import { getHavaDurumu } from "../api/havaDurumu";
import { HavaDurumu } from "../api/types";
import { Card } from "../components";
import { havaDurumuIkonu } from "../constants/havaDurumu";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, spacing, typography, useThemeColors } from "../theme";

export default function HavaDurumuDetayScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [veri, setVeri] = useState<HavaDurumu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getHavaDurumu()
      .then(setVeri)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  function formatGun(iso: string, index: number): string {
    if (index === 0) return t("havaDurumu_today");
    return new Date(iso).toLocaleDateString("tr-TR", { weekday: "short" });
  }

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
          {t("havaDurumu_title")}
        </Text>
      </View>
      <View style={styles.content}>
        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("havaDurumu_error")}</Text>
        )}

        {!isLoading && !error && veri && (
          <>
            <Card style={styles.currentCard}>
              <View>
                <Text style={styles.location}>{t("havaDurumu_location")}</Text>
                <Text style={styles.condition}>{veri.durumAdi}</Text>
                <Text style={styles.hissedilen}>
                  {t("havaDurumu_feelsLike")}{" "}
                  {Math.round(veri.hissedilenSicaklik)}°C
                </Text>
              </View>
              <View style={styles.tempRow}>
                <MaterialIcons
                  name={havaDurumuIkonu(veri.durumKodu)}
                  size={40}
                  color={colors.secondary}
                />
                <Text style={styles.temp}>{Math.round(veri.sicaklik)}°C</Text>
              </View>
            </Card>
            <View style={styles.metricsRow}>
              <Card style={styles.metricCard}>
                <MaterialIcons
                  name="water-drop"
                  size={24}
                  color={colors.secondary}
                />
                <Text style={styles.metricLabel}>
                  {t("havaDurumu_humidity")}
                </Text>
                <Text style={styles.metricValue}>%{veri.nem}</Text>
              </Card>
              <Card style={styles.metricCard}>
                <MaterialIcons name="air" size={24} color={colors.secondary} />
                <Text style={styles.metricLabel}>{t("havaDurumu_wind")}</Text>
                <Text style={styles.metricValue}>
                  {Math.round(veri.ruzgarHiz)} km/s
                </Text>
              </Card>
            </View>

            {veri.gunlukTahmin.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  {t("havaDurumu_forecast5Day")}
                </Text>
                <View style={styles.forecastRow}>
                  {veri.gunlukTahmin.slice(1, 6).map((gun, index) => (
                    <Card key={gun.tarih} style={styles.forecastCard}>
                      <Text style={styles.forecastDay}>
                        {formatGun(gun.tarih, index + 1)}
                      </Text>
                      <MaterialIcons
                        name={havaDurumuIkonu(gun.durumKodu)}
                        size={20}
                        color={colors.secondary}
                      />
                      <Text style={styles.forecastTemp}>
                        {Math.round(gun.enYuksek)}°/{Math.round(gun.enDusuk)}°
                      </Text>
                    </Card>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.sourceText}>{t("havaDurumu_source")}</Text>
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
    currentCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.containerMargin,
    },
    location: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    condition: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    hissedilen: {
      ...typography.labelSm,
      color: colors.outline,
    },
    tempRow: {
      alignItems: "center",
      gap: 4,
    },
    temp: {
      ...typography.headlineMdMobile,
      color: colors.onBackground,
    },
    metricsRow: {
      flexDirection: "row",
      gap: spacing.gridGutter,
    },
    metricCard: {
      flex: 1,
      alignItems: "center",
      gap: 4,
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
    sectionTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    forecastRow: {
      flexDirection: "row",
      gap: spacing.stackGap / 2,
    },
    forecastCard: {
      flex: 1,
      alignItems: "center",
      gap: 4,
      padding: spacing.stackGap / 2,
    },
    forecastDay: {
      ...typography.labelSm,
      color: colors.outline,
    },
    forecastTemp: {
      ...typography.labelSm,
      color: colors.onBackground,
    },
    sourceText: {
      ...typography.labelSm,
      color: colors.outline,
      textAlign: "center",
    },
  });
