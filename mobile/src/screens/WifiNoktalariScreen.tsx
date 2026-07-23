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

import { getWifiNoktalari } from "../api/wifiNoktalari";
import { WifiKategorisi, WifiNoktasi } from "../api/types";
import { Card, SecondaryButton, SegmentedControl } from "../components";
import { colors, shape, spacing, typography } from "../theme";

type FilterKey = "hepsi" | WifiKategorisi;

const FILTER_OPTIONS: { label: string; value: FilterKey }[] = [
  { label: "Hepsi", value: "hepsi" },
  { label: "Parklar", value: "parklar" },
  { label: "Meydanlar", value: "meydanlar" },
];

export default function WifiNoktalariScreen() {
  const navigation = useNavigation();
  const [hotspots, setHotspots] = useState<WifiNoktasi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("hepsi");

  useEffect(() => {
    getWifiNoktalari()
      .then(setHotspots)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const visibleHotspots = useMemo(
    () =>
      hotspots.filter(
        (hotspot) => filter === "hepsi" || hotspot.kategori === filter,
      ),
    [hotspots, filter],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Geri dön"
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Wi-Fi Noktaları</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.mapPreview}>
          <MaterialIcons name="wifi" size={28} color={colors.secondary} />
          <Text style={styles.mapPreviewText}>
            Şehir Genelinde {hotspots.length} Aktif Nokta
          </Text>
        </View>

        <SegmentedControl
          options={FILTER_OPTIONS}
          value={filter}
          onChange={setFilter}
        />

        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>Wi-Fi noktaları yüklenemedi.</Text>
        )}
        {!isLoading && !error && visibleHotspots.length === 0 && (
          <Text style={styles.emptyText}>Bu kategoride nokta bulunmuyor.</Text>
        )}

        <View style={styles.list}>
          {!isLoading &&
            !error &&
            visibleHotspots.map((hotspot) => (
              <Card key={hotspot.id} style={styles.card}>
                <Text style={styles.name} numberOfLines={1}>
                  {hotspot.ad}
                </Text>
                <Text style={styles.address} numberOfLines={1}>
                  {hotspot.adres}
                </Text>
                <SecondaryButton
                  label="Yol Tarifi Al"
                  onPress={() => navigation.navigate("Map" as never)}
                />
              </Card>
            ))}
        </View>
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
  mapPreview: {
    height: 96,
    borderRadius: shape.rounded,
    backgroundColor: colors.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  mapPreviewText: {
    ...typography.labelSm,
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
    flex: 1,
    justifyContent: "space-between",
    gap: spacing.stackGap / 2,
  },
  card: {
    padding: spacing.stackGap,
    gap: 4,
  },
  name: {
    ...typography.labelLg,
    color: colors.onBackground,
    flexShrink: 1,
  },
  address: {
    ...typography.bodyMd,
    color: colors.outline,
  },
});
