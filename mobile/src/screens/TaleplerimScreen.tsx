import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { ComponentProps, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getRequest } from "../api/requests";
import { TalepDurumu, TalepRequest } from "../api/types";
import { Card, PrimaryButton } from "../components";
import { talepKategorisiEtiketi } from "../constants/talepKategorileri";
import { getTakipNumaralari } from "../storage/talepStorage";
import { colors, spacing, typography } from "../theme";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

const durumMeta: Record<
  TalepDurumu,
  { icon: IconName; label: string; color: string }
> = {
  tamamlandi: {
    icon: "check-circle",
    label: "Tamamlandı",
    color: colors.secondary,
  },
  islemde: {
    icon: "autorenew",
    label: "İşlemde",
    color: colors.primaryContainer,
  },
  beklemede: { icon: "schedule", label: "Beklemede", color: colors.outline },
};

function formatTarih(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function TaleplerimScreen() {
  const navigation = useNavigation();
  const [talepler, setTalepler] = useState<TalepRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let iptalEdildi = false;

      async function yukle() {
        setIsLoading(true);
        setError(false);
        try {
          const takipNumaralari = await getTakipNumaralari();
          const sonuclar = await Promise.allSettled(
            takipNumaralari.map((id) => getRequest(id)),
          );
          if (iptalEdildi) return;

          const basarili = sonuclar
            .filter(
              (sonuc): sonuc is PromiseFulfilledResult<TalepRequest> =>
                sonuc.status === "fulfilled",
            )
            .map((sonuc) => sonuc.value);
          setTalepler(basarili);
        } catch {
          if (!iptalEdildi) setError(true);
        } finally {
          if (!iptalEdildi) setIsLoading(false);
        }
      }

      yukle();
      return () => {
        iptalEdildi = true;
      };
    }, []),
  );

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
        <Text style={styles.headerTitle}>Taleplerim</Text>
        <Pressable
          onPress={() => navigation.navigate("YeniTalepOlustur" as never)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Yeni Talep Oluştur"
          style={styles.addButton}
        >
          <MaterialIcons name="add-circle" size={24} color={colors.onPrimary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <PrimaryButton
          label="Yeni Talep Oluştur"
          onPress={() => navigation.navigate("YeniTalepOlustur" as never)}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mevcut Talepleriniz</Text>
          <Text style={styles.sectionCount}>{talepler.length} Kayıt</Text>
        </View>

        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>Talepleriniz yüklenemedi.</Text>
        )}
        {!isLoading && !error && talepler.length === 0 && (
          <Text style={styles.emptyText}>
            Henüz bir talebiniz yok. &ldquo;Yeni Talep Oluştur&rdquo; ile
            başlayabilirsiniz.
          </Text>
        )}

        {!isLoading &&
          !error &&
          talepler.map((talep) => {
            const meta = durumMeta[talep.durum];
            return (
              <Card key={talep.id} style={styles.talepCard}>
                <View style={styles.talepRow}>
                  <Text style={styles.talepNo}>
                    No: {talep.id.slice(-8).toUpperCase()}
                  </Text>
                  <View style={styles.durumBadge}>
                    <MaterialIcons
                      name={meta.icon}
                      size={14}
                      color={meta.color}
                    />
                    <Text style={[styles.durumLabel, { color: meta.color }]}>
                      {meta.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.talepTitle}>
                  {talepKategorisiEtiketi(talep.kategori)}
                </Text>
                <Text style={styles.talepAciklama} numberOfLines={2}>
                  {talep.aciklama}
                </Text>
                <View style={styles.talepDateRow}>
                  <MaterialIcons
                    name="calendar-today"
                    size={14}
                    color={colors.outline}
                  />
                  <Text style={styles.talepDate}>
                    {formatTarih(talep.createdAt)}
                  </Text>
                </View>
              </Card>
            );
          })}
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
    flex: 1,
  },
  addButton: {
    marginLeft: "auto",
  },
  content: {
    flex: 1,
    padding: spacing.containerMargin,
    gap: spacing.stackGap,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    ...typography.titleMd,
    color: colors.onBackground,
  },
  sectionCount: {
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
  talepCard: {
    padding: spacing.stackGap,
    gap: 4,
  },
  talepRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  talepNo: {
    ...typography.labelSm,
    color: colors.outline,
  },
  durumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  durumLabel: {
    ...typography.labelSm,
    fontWeight: "600",
  },
  talepTitle: {
    ...typography.labelLg,
    color: colors.onBackground,
  },
  talepAciklama: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  talepDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  talepDate: {
    ...typography.bodyMd,
    color: colors.outline,
  },
});
