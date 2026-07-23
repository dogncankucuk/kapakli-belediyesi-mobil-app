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

import { getUlasimHatlari } from "../api/ulasimHatlari";
import { UlasimHatti } from "../api/types";
import { Card, PrimaryButton } from "../components";
import { colors, spacing, typography } from "../theme";

export default function UlasimHizmetleriScreen() {
  const navigation = useNavigation();
  const [hatlar, setHatlar] = useState<UlasimHatti[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getUlasimHatlari()
      .then(setHatlar)
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
        <Text style={styles.headerTitle}>Ulaşım Hizmetleri</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.description}>
          Otobüs hatları, güzergahlar ve ücret tarifesi.
        </Text>

        <Card style={styles.liveCard}>
          <Text style={styles.liveBadge}>CANLI TAKIP</Text>
          <Text style={styles.liveTitle}>Otobüsüm Nerede?</Text>
          <PrimaryButton
            label="Haritayı Aç"
            onPress={() => navigation.navigate("Map" as never)}
          />
        </Card>

        <Text style={styles.sectionTitle}>Aktif Hatlar</Text>

        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>Hat bilgileri yüklenemedi.</Text>
        )}
        {!isLoading && !error && hatlar.length === 0 && (
          <Text style={styles.emptyText}>Henüz hat bilgisi eklenmemiş.</Text>
        )}

        <View style={styles.lines}>
          {!isLoading &&
            !error &&
            hatlar.map((hat) => (
              <Card key={hat.id} style={styles.lineCard}>
                <View style={styles.lineHeader}>
                  <Text style={styles.lineName}>{hat.hatAdi}</Text>
                  <Text
                    style={[
                      styles.lineStatus,
                      hat.canli && styles.lineStatusLive,
                    ]}
                  >
                    {hat.canli ? "CANLI" : hat.durum}
                  </Text>
                </View>
                <Text style={styles.lineRoute}>{hat.guzergah}</Text>
                {hat.canli ? (
                  <Text style={styles.lineDetail}>{hat.durum}</Text>
                ) : null}
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
  description: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  liveCard: {
    padding: spacing.stackGap,
    gap: spacing.stackGap / 2,
    backgroundColor: colors.primaryContainer,
  },
  liveBadge: {
    ...typography.labelSm,
    color: colors.secondaryContainer,
  },
  liveTitle: {
    ...typography.titleMd,
    color: colors.onPrimary,
    marginBottom: spacing.stackGap / 2,
  },
  sectionTitle: {
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
  lines: {
    gap: spacing.stackGap,
  },
  lineCard: {
    padding: spacing.stackGap,
    gap: 2,
  },
  lineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lineName: {
    ...typography.labelLg,
    color: colors.onBackground,
  },
  lineStatus: {
    ...typography.labelSm,
    color: colors.outline,
  },
  lineStatusLive: {
    color: colors.secondary,
  },
  lineRoute: {
    ...typography.bodyMd,
    color: colors.onBackground,
  },
  lineDetail: {
    ...typography.labelSm,
    color: colors.outline,
  },
});
