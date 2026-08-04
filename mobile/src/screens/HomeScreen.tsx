import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAnnouncements } from "../api/announcements";
import { getHavaDurumu } from "../api/havaDurumu";
import { Announcement, HavaDurumu } from "../api/types";
import {
  AnnouncementCard,
  Card,
  HizliIslemlerModal,
  PrimaryButton,
  ServiceGridCard,
  TopBar,
} from "../components";
import { havaDurumuIkonu } from "../constants/havaDurumu";
import {
  navigateToServiceTarget,
  SERVICE_CATALOG,
  ServiceId,
} from "../constants/serviceCatalog";
import { useTranslation } from "../i18n/LocaleContext";
import { useAppShell } from "../navigation/AppShellContext";
import {
  getSeciliHizliIslemler,
  seciliHizliIslemleriKaydet,
} from "../storage/quickActionsStorage";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

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
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [havaDurumu, setHavaDurumu] = useState<HavaDurumu | null>(null);
  const [hizliIslemIdleri, setHizliIslemIdleri] = useState<ServiceId[]>([]);
  const [isHizliIslemlerModalVisible, setIsHizliIslemlerModalVisible] =
    useState(false);

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
    getSeciliHizliIslemler().then(setHizliIslemIdleri);
  }, []);

  const secilenHizliIslemler = useMemo(
    () =>
      hizliIslemIdleri
        .map((id) => SERVICE_CATALOG.find((service) => service.id === id))
        .filter((service): service is (typeof SERVICE_CATALOG)[number] =>
          Boolean(service),
        ),
    [hizliIslemIdleri],
  );

  const handleHizliIslemlerKaydet = (ids: ServiceId[]) => {
    setHizliIslemIdleri(ids);
    setIsHizliIslemlerModalVisible(false);
    seciliHizliIslemleriKaydet(ids);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar
        title={t("common_appName")}
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
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.welcomeTitle}>{t("home_welcome")}</Text>
          <Text style={styles.welcomeSubtitle}>
            {t("home_welcomeSubtitle")}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("home_quickActions")}</Text>
            <Pressable
              onPress={() => setIsHizliIslemlerModalVisible(true)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t("home_quickActionsEdit")}
            >
              <MaterialIcons
                name="add-circle-outline"
                size={24}
                color={colors.primaryContainer}
              />
            </Pressable>
          </View>
          <View style={styles.quickActionsRow}>
            {secilenHizliIslemler.map((service) => (
              <View key={service.id} style={styles.quickActionItem}>
                <ServiceGridCard
                  icon={service.icon}
                  label={t(service.labelKey)}
                  onPress={() =>
                    navigateToServiceTarget(navigation, service.target)
                  }
                />
              </View>
            ))}
          </View>
        </View>

        <HizliIslemlerModal
          visible={isHizliIslemlerModalVisible}
          selectedIds={hizliIslemIdleri}
          onClose={() => setIsHizliIslemlerModalVisible(false)}
          onSave={handleHizliIslemlerKaydet}
        />

        <PrimaryButton
          label={t("home_myRequests")}
          onPress={() => navigation.navigate("Taleplerim" as never)}
        />

        <Pressable
          onPress={() => navigation.navigate("Projelerimiz" as never)}
          accessibilityRole="button"
        >
          <Card style={styles.projelerButton}>
            <MaterialIcons
              name="architecture"
              size={28}
              color={colors.onPrimary}
            />
            <Text style={styles.projelerButtonLabel}>{t("home_projects")}</Text>
            <MaterialIcons
              name="chevron-right"
              size={26}
              color={colors.onPrimary}
            />
          </Card>
        </Pressable>

        <View style={styles.announcements}>
          {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
          {!isLoading && error && (
            <Text style={styles.errorText}>{t("announcements_error")}</Text>
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
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    quickActionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.gridGutter,
    },
    quickActionItem: {
      width: "31%",
    },
    projelerButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
      minHeight: 72,
      padding: spacing.containerMargin,
      borderRadius: shape.roundedLg,
      backgroundColor: colors.primaryContainer,
    },
    projelerButtonLabel: {
      ...typography.titleMd,
      color: colors.onPrimary,
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
