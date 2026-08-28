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

import { getHaberler } from "../api/haberler";
import { Haber } from "../api/types";
import {
  AnnouncementCard,
  HavaVeAramaSag,
  HizliIslemlerModal,
  PrimaryButton,
  ServiceGridCard,
  TopBar,
} from "../components";
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
import { Colors, spacing, typography, useThemeColors } from "../theme";

function formatHaberDate(item: Haber): string {
  return new Date(item.yayinTarihi).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { openMenu } = useAppShell();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [haberler, setHaberler] = useState<Haber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hizliIslemIdleri, setHizliIslemIdleri] = useState<ServiceId[]>([]);
  const [isHizliIslemlerModalVisible, setIsHizliIslemlerModalVisible] =
    useState(false);

  useEffect(() => {
    getHaberler()
      .then((data) => setHaberler(data.slice(0, 2)))
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
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
          <HavaVeAramaSag
            onSearchPress={() =>
              (
                navigation.navigate as (
                  screen: string,
                  params?: object,
                ) => void
              )("Services", { screen: "ServicesMain", params: { acSearch: true } })
            }
          />
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

        <PrimaryButton
          label={t("tabs_map")}
          onPress={() => navigation.navigate("Map" as never)}
        />

        <View style={styles.announcements}>
          {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
          {!isLoading && error && (
            <Text style={styles.errorText}>{t("home_haberlerError")}</Text>
          )}
          {!isLoading &&
            !error &&
            haberler.map((item) => (
              <AnnouncementCard
                key={item.id}
                title={item.baslik}
                date={formatHaberDate(item)}
                imageUrl={item.resimUrlleri[0] ?? null}
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
    announcements: {
      gap: spacing.stackGap,
    },
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
    },
  });
