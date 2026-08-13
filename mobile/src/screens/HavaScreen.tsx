import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getHavaDurumu } from "../api/havaDurumu";
import { getHavaKalitesi } from "../api/havaKalitesi";
import { HavaDurumu, HavaKalitesi } from "../api/types";
import { Card, SegmentedControl, TopBar } from "../components";
import { havaDurumuIkonu } from "../constants/havaDurumu";
import { useTranslation } from "../i18n/LocaleContext";
import { useAppShell } from "../navigation/AppShellContext";
import { Colors, spacing, typography, useThemeColors } from "../theme";

function formatSaat(iso: string): string {
  return new Date(iso).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HavaScreen() {
  const { openMenu } = useAppShell();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [segment, setSegment] = useState<"durum" | "kalite">("durum");

  const [durum, setDurum] = useState<HavaDurumu | null>(null);
  const [durumError, setDurumError] = useState(false);
  const [durumLoading, setDurumLoading] = useState(true);

  const [kalite, setKalite] = useState<HavaKalitesi | null>(null);
  const [kaliteError, setKaliteError] = useState(false);
  const [kaliteLoading, setKaliteLoading] = useState(true);

  useEffect(() => {
    getHavaDurumu()
      .then(setDurum)
      .catch(() => setDurumError(true))
      .finally(() => setDurumLoading(false));
    getHavaKalitesi()
      .then(setKalite)
      .catch(() => setKaliteError(true))
      .finally(() => setKaliteLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar title={t("havaDurumu_title")} onMenuPress={openMenu} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SegmentedControl
          value={segment}
          onChange={setSegment}
          options={[
            { value: "durum", label: t("services_havaDurumu") },
            { value: "kalite", label: t("services_havaKalitesi") },
          ]}
        />

        {segment === "durum" && (
          <>
            {durumLoading && (
              <ActivityIndicator color={colors.primaryContainer} />
            )}
            {!durumLoading && durumError && (
              <Text style={styles.errorText}>{t("havaDurumu_error")}</Text>
            )}
            {!durumLoading && !durumError && durum && (
              <>
                <Card style={styles.currentCard}>
                  <View>
                    <Text style={styles.location}>
                      {t("havaDurumu_location")}
                    </Text>
                    <Text style={styles.condition}>{durum.durumAdi}</Text>
                    <Text style={styles.hissedilen}>
                      {t("havaDurumu_feelsLike")}{" "}
                      {Math.round(durum.hissedilenSicaklik)}°C
                    </Text>
                  </View>
                  <View style={styles.tempRow}>
                    <MaterialIcons
                      name={havaDurumuIkonu(durum.durumKodu)}
                      size={40}
                      color={colors.secondary}
                    />
                    <Text style={styles.temp}>
                      {Math.round(durum.sicaklik)}°C
                    </Text>
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
                    <Text style={styles.metricValue}>%{durum.nem}</Text>
                  </Card>
                  <Card style={styles.metricCard}>
                    <MaterialIcons
                      name="air"
                      size={24}
                      color={colors.secondary}
                    />
                    <Text style={styles.metricLabel}>
                      {t("havaDurumu_wind")}
                    </Text>
                    <Text style={styles.metricValue}>
                      {Math.round(durum.ruzgarHiz)} km/s
                    </Text>
                  </Card>
                </View>
                {durum.gunlukTahmin.length > 0 && (
                  <View style={styles.forecastRow}>
                    {durum.gunlukTahmin.slice(1, 6).map((gun) => (
                      <Card key={gun.tarih} style={styles.forecastCard}>
                        <Text style={styles.forecastDay}>
                          {new Date(gun.tarih).toLocaleDateString("tr-TR", {
                            weekday: "short",
                          })}
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
                )}
                <Text style={styles.sourceText}>{t("havaDurumu_source")}</Text>
              </>
            )}
          </>
        )}

        {segment === "kalite" && (
          <>
            {kaliteLoading && (
              <ActivityIndicator color={colors.primaryContainer} />
            )}
            {!kaliteLoading && kaliteError && (
              <Text style={styles.errorText}>{t("havaKalitesi_error")}</Text>
            )}
            {!kaliteLoading && !kaliteError && kalite && (
              <>
                <Card style={styles.gaugeCard}>
                  <View
                    style={[styles.gauge, { borderColor: kalite.durum.renk }]}
                  >
                    <Text style={styles.gaugeValue}>{kalite.aqi}</Text>
                    <Text
                      style={[styles.gaugeLabel, { color: kalite.durum.renk }]}
                    >
                      {kalite.durum.ad}
                    </Text>
                  </View>
                  <Text style={styles.gaugeDescription}>
                    {kalite.durum.aciklama}
                  </Text>
                  <Text style={styles.stationText}>
                    {kalite.istasyonAdi} · {formatSaat(kalite.olcumZamani)}
                  </Text>
                </Card>
                <View style={styles.metricsRow}>
                  <Card style={styles.metricCard}>
                    <Text style={styles.metricLabel}>PM2.5</Text>
                    <Text style={styles.metricValue}>
                      {kalite.kirleticiler.pm25?.toFixed(1) ?? "-"}
                    </Text>
                  </Card>
                  <Card style={styles.metricCard}>
                    <Text style={styles.metricLabel}>PM10</Text>
                    <Text style={styles.metricValue}>
                      {kalite.kirleticiler.pm10?.toFixed(1) ?? "-"}
                    </Text>
                  </Card>
                  <Card style={styles.metricCard}>
                    <Text style={styles.metricLabel}>NO2</Text>
                    <Text style={styles.metricValue}>
                      {kalite.kirleticiler.no2?.toFixed(1) ?? "-"}
                    </Text>
                  </Card>
                </View>
                <Text style={styles.sourceText}>
                  {t("havaKalitesi_source")}
                </Text>
              </>
            )}
          </>
        )}
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
    content: {
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
    sourceText: {
      ...typography.labelSm,
      color: colors.outline,
      textAlign: "center",
    },
  });
