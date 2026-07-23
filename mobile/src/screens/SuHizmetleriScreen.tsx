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

import { getBarajlar, getPlanliKesintiler } from "../api/suHizmetleri";
import { Baraj, PlanliKesinti } from "../api/types";
import { Card, PrimaryButton, SecondaryButton } from "../components";
import { colors, spacing, typography } from "../theme";

function formatKesintiTarih(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

export default function SuHizmetleriScreen() {
  const navigation = useNavigation();
  const [barajlar, setBarajlar] = useState<Baraj[]>([]);
  const [kesintiler, setKesintiler] = useState<PlanliKesinti[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([getBarajlar(), getPlanliKesintiler()])
      .then(([barajData, kesintiData]) => {
        setBarajlar(barajData);
        setKesintiler(kesintiData);
      })
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
          accessibilityLabel="Geri"
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Su Hizmetleri</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Hizmetler ve anlık durum takibi</Text>

        <PrimaryButton label="Arıza Bildirimi Yap" onPress={() => {}} />

        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>
            Su hizmetleri verisi yüklenemedi.
          </Text>
        )}

        {!isLoading && !error && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Baraj Doluluk</Text>
              {barajlar.length === 0 ? (
                <Text style={styles.emptyText}>Baraj verisi girilmemiş.</Text>
              ) : (
                <View style={styles.barajRow}>
                  {barajlar.map((baraj) => (
                    <View key={baraj.id} style={styles.barajItem}>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { height: `${baraj.doluluk}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.barajPercent}>%{baraj.doluluk}</Text>
                      <Text style={styles.barajName} numberOfLines={1}>
                        {baraj.ad}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Planlı Kesintiler</Text>
              {kesintiler.length === 0 ? (
                <Text style={styles.emptyText}>Planlı kesinti bulunmuyor.</Text>
              ) : (
                kesintiler.map((kesinti) => (
                  <View key={kesinti.id} style={styles.kesintiRow}>
                    <Text style={styles.kesintiDate}>
                      {formatKesintiTarih(kesinti.tarih)}
                    </Text>
                    <View style={styles.kesintiInfo}>
                      <Text style={styles.kesintiDistrict}>{kesinti.ilce}</Text>
                      <Text style={styles.kesintiDescription}>
                        {kesinti.aciklama}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </Card>
          </>
        )}

        <View style={styles.actionsRow}>
          <SecondaryButton
            label="Fatura Ödeme"
            onPress={() => navigation.navigate("FaturaOdeme" as never)}
            style={styles.actionButton}
          />
          <SecondaryButton
            label="Endeks Bildir"
            onPress={() => {}}
            style={styles.actionButton}
          />
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
  headerTitle: {
    ...typography.titleLg,
    color: colors.onPrimary,
  },
  content: {
    flex: 1,
    padding: spacing.containerMargin,
    gap: spacing.stackGap,
  },
  subtitle: {
    ...typography.bodyMd,
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
  card: {
    padding: spacing.containerMargin,
    gap: spacing.stackGap,
  },
  cardTitle: {
    ...typography.titleMd,
    color: colors.onBackground,
  },
  barajRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barajItem: {
    alignItems: "center",
    gap: 4,
  },
  barTrack: {
    width: 28,
    height: 64,
    borderRadius: 6,
    backgroundColor: colors.outlineVariant,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    backgroundColor: colors.secondary,
  },
  barajPercent: {
    ...typography.labelSm,
    color: colors.onBackground,
    fontWeight: "600",
  },
  barajName: {
    ...typography.labelSm,
    color: colors.outline,
  },
  kesintiRow: {
    flexDirection: "row",
    gap: spacing.stackGap,
  },
  kesintiDate: {
    ...typography.labelLg,
    color: colors.secondary,
    width: 48,
  },
  kesintiInfo: {
    flex: 1,
  },
  kesintiDistrict: {
    ...typography.labelLg,
    color: colors.onBackground,
  },
  kesintiDescription: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.gridGutter,
  },
  actionButton: {
    flex: 1,
  },
});
