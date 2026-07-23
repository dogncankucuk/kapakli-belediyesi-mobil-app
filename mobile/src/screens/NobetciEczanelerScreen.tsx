import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getPharmacies } from "../api/pharmacies";
import { Pharmacy } from "../api/types";
import { Card, SecondaryButton } from "../components";
import { colors, spacing, typography } from "../theme";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
}

export default function NobetciEczanelerScreen() {
  const navigation = useNavigation();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPharmacies()
      .then(setPharmacies)
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
          accessibilityLabel="Geri dön"
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Nöbetçi Eczaneler</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.dateText}>
          {formatDate(new Date().toISOString())}
        </Text>

        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>Nöbetçi eczaneler yüklenemedi.</Text>
        )}
        {!isLoading && !error && pharmacies.length === 0 && (
          <Text style={styles.emptyText}>
            Bugün için nöbetçi eczane bilgisi girilmemiş.
          </Text>
        )}

        <View style={styles.list}>
          {!isLoading &&
            !error &&
            pharmacies.map((pharmacy) => (
              <Card key={pharmacy.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.name} numberOfLines={1}>
                    {pharmacy.ad}
                  </Text>
                  <Text style={styles.openBadge}>AÇIK</Text>
                </View>
                <Text style={styles.address} numberOfLines={1}>
                  {pharmacy.adres}
                </Text>
                <View style={styles.phoneRow}>
                  <MaterialIcons
                    name="call"
                    size={16}
                    color={colors.secondary}
                  />
                  <Text style={styles.phone}>{pharmacy.telefon}</Text>
                </View>
                <SecondaryButton
                  label="Haritada Gör"
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
    gap: spacing.stackGap / 2,
  },
  dateText: {
    ...typography.labelSm,
    color: colors.outline,
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    ...typography.labelLg,
    color: colors.onBackground,
    flexShrink: 1,
  },
  openBadge: {
    ...typography.labelSm,
    color: colors.secondary,
  },
  address: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  phone: {
    ...typography.bodyMd,
    color: colors.onBackground,
  },
});
