import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAnnouncements } from "../api/announcements";
import { getHavaDurumu } from "../api/havaDurumu";
import { Announcement, HavaDurumu } from "../api/types";
import {
  AnnouncementCard,
  PrimaryButton,
  ServiceGridCard,
  TopBar,
} from "../components";
import { havaDurumuIkonu } from "../constants/havaDurumu";
import { useAppShell } from "../navigation/AppShellContext";
import { colors, spacing, typography } from "../theme";

function formatAnnouncementDate(item: Announcement): string {
  const date = new Date(item.yayinTarihi).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${item.kategori} • ${date}`;
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { openMenu } = useAppShell();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [havaDurumu, setHavaDurumu] = useState<HavaDurumu | null>(null);

  useEffect(() => {
    getAnnouncements()
      .then((data) => setAnnouncements(data.slice(0, 2)))
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
    getHavaDurumu()
      .then(setHavaDurumu)
      .catch(() => {
        // Ana sayfa widget'i icin sessiz basarisizlik kabul edilebilir -
        // detay ekrani (HavaDurumuDetayScreen) kendi hata durumunu gosterir.
      });
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar
        title="Kapaklı Belediyesi"
        onMenuPress={openMenu}
        rightSlot={
          havaDurumu && (
            <View style={styles.weather}>
              <View style={styles.weatherRow}>
                <MaterialIcons
                  name={havaDurumuIkonu(havaDurumu.durumKodu)}
                  size={18}
                  color={colors.onPrimary}
                />
                <Text style={styles.weatherTemp}>
                  {Math.round(havaDurumu.sicaklik)}°C
                </Text>
              </View>
              <Text style={styles.weatherCondition}>{havaDurumu.durumAdi}</Text>
            </View>
          )
        }
      />
      <View style={styles.content}>
        <View>
          <Text style={styles.welcomeTitle}>Hoş Geldiniz</Text>
          <Text style={styles.welcomeSubtitle}>
            Size nasıl yardımcı olabiliriz?
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.quickActionsRow}>
            <View style={styles.quickActionItem}>
              <ServiceGridCard
                icon="article"
                label="Haberler"
                onPress={() =>
                  navigation.navigate("Announcements", {
                    screen: "HaberlerVeEtkinlikler",
                  } as never)
                }
              />
            </View>
            <View style={styles.quickActionItem}>
              <ServiceGridCard
                icon="local-pharmacy"
                label="Eczaneler"
                onPress={() =>
                  navigation.navigate("Map", {
                    screen: "NobetciEczaneler",
                  } as never)
                }
              />
            </View>
          </View>
        </View>

        <PrimaryButton
          label="Taleplerim"
          onPress={() =>
            navigation.navigate("Services", {
              screen: "Taleplerim",
            } as never)
          }
        />

        <View style={styles.announcements}>
          {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
          {!isLoading && error && (
            <Text style={styles.errorText}>Duyurular yüklenemedi.</Text>
          )}
          {!isLoading &&
            !error &&
            announcements.map((item) => (
              <AnnouncementCard
                key={item.id}
                title={item.baslik}
                date={formatAnnouncementDate(item)}
              />
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
  content: {
    flex: 1,
    padding: spacing.containerMargin,
    gap: spacing.stackGap,
  },
  weather: {
    alignItems: "flex-end",
    gap: 2,
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  weatherTemp: {
    ...typography.labelLg,
    color: colors.onPrimary,
  },
  weatherCondition: {
    ...typography.labelSm,
    color: colors.onPrimaryContainer,
  },
  welcomeTitle: {
    ...typography.headlineMdMobile,
    color: colors.onBackground,
  },
  welcomeSubtitle: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  section: {
    gap: spacing.stackGap,
  },
  sectionTitle: {
    ...typography.titleMd,
    color: colors.onBackground,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: spacing.gridGutter,
  },
  quickActionItem: {
    flex: 1,
  },
  announcements: {
    gap: spacing.stackGap,
  },
  errorText: {
    ...typography.bodyMd,
    color: colors.error,
  },
});
