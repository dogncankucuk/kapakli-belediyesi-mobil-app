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

import { getMeclisKararlari } from "../api/meclisKararlari";
import { MeclisKarari } from "../api/types";
import { Card, SegmentedControl } from "../components";
import { colors, shape, spacing, typography } from "../theme";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function MeclisKararlariScreen() {
  const navigation = useNavigation();
  const [kararlar, setKararlar] = useState<MeclisKarari[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [year, setYear] = useState<string | null>(null);

  useEffect(() => {
    getMeclisKararlari()
      .then((data) => {
        setKararlar(data);
        if (data.length > 0) {
          setYear(new Date(data[0].tarih).getFullYear().toString());
        }
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const years = useMemo(() => {
    const uniqueYears = new Set(
      kararlar.map((k) => new Date(k.tarih).getFullYear().toString()),
    );
    return Array.from(uniqueYears).sort((a, b) => Number(b) - Number(a));
  }, [kararlar]);

  const visibleKararlar = useMemo(
    () =>
      kararlar
        .filter((k) => new Date(k.tarih).getFullYear().toString() === year)
        .slice(0, 3),
    [kararlar, year],
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
        <Text style={styles.headerTitle} numberOfLines={1}>
          Meclis Kararları
        </Text>
      </View>
      <View style={styles.content}>
        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>Meclis kararları yüklenemedi.</Text>
        )}
        {!isLoading && !error && kararlar.length === 0 && (
          <Text style={styles.emptyText}>Henüz karar eklenmemiş.</Text>
        )}

        {!isLoading && !error && years.length > 0 && year && (
          <>
            <SegmentedControl
              options={years.map((y) => ({ label: y, value: y }))}
              value={year}
              onChange={setYear}
            />
            <View style={styles.list}>
              {visibleKararlar.map((item) => (
                <Card key={item.id} style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.decisionNumber}>
                      KARAR NO: {item.kararNo}
                    </Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{item.kategori}</Text>
                    </View>
                  </View>
                  <Text style={styles.date}>{formatDate(item.tarih)}</Text>
                  <Text style={styles.decisionTitle} numberOfLines={2}>
                    {item.baslik}
                  </Text>
                </Card>
              ))}
            </View>
          </>
        )}
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
  emptyText: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  list: {
    gap: spacing.stackGap,
  },
  card: {
    padding: spacing.stackGap,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  decisionNumber: {
    ...typography.labelSm,
    color: colors.outline,
  },
  categoryBadge: {
    backgroundColor: colors.secondaryContainer,
    borderRadius: shape.rounded,
    paddingHorizontal: spacing.stackGap / 2,
    paddingVertical: 2,
  },
  categoryText: {
    ...typography.labelSm,
    color: colors.primary,
  },
  date: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  decisionTitle: {
    ...typography.labelLg,
    color: colors.onBackground,
  },
});
