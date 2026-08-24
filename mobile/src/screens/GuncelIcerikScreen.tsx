import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
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
import { getHaberler } from "../api/haberler";
import { getIhaleler } from "../api/ihaleler";
import { getIlanlar } from "../api/ilanlar";
import { getMakaleler } from "../api/makaleler";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";
import { Colors, spacing, typography, useThemeColors } from "../theme";

export type GuncelIcerikKategori =
  "haberler" | "duyurular" | "ilanlar" | "ihaleler" | "makaleler";

type IcerikKaydi = {
  id: string;
  baslik: string;
  icerik: string;
  tarih: string;
};

const TITLE_KEYS: Record<GuncelIcerikKategori, TranslationKey> = {
  haberler: "guncel_haberler",
  duyurular: "guncel_duyurular",
  ilanlar: "guncel_ilanlar",
  ihaleler: "guncel_ihaleler",
  makaleler: "guncel_makaleler",
};

// Her kategori admin panelde ayri yonetilen kendi backend kaynagina sahip -
// bu yuzden ekran, kategoriye gore dogru fetch fonksiyonunu secip ortak bir
// {id, baslik, icerik, tarih} sekline indirgeniyor.
const FETCHERS: Record<GuncelIcerikKategori, () => Promise<IcerikKaydi[]>> = {
  haberler: async () =>
    (await getHaberler()).map((h) => ({
      id: h.id,
      baslik: h.baslik,
      icerik: h.icerik,
      tarih: h.yayinTarihi,
    })),
  duyurular: async () =>
    (await getAnnouncements()).map((a) => ({
      id: a.id,
      baslik: a.baslik,
      icerik: a.icerik,
      tarih: a.yayinTarihi,
    })),
  ilanlar: async () =>
    (await getIlanlar()).map((i) => ({
      id: i.id,
      baslik: i.baslik,
      icerik: i.icerik,
      tarih: i.yayinTarihi,
    })),
  ihaleler: async () =>
    (await getIhaleler()).map((i) => ({
      id: i.id,
      baslik: i.baslik,
      icerik: i.icerik,
      tarih: i.yayinTarihi,
    })),
  makaleler: async () =>
    (await getMakaleler()).map((m) => ({
      id: m.id,
      baslik: m.baslik,
      icerik: m.icerik,
      tarih: m.yayinTarihi,
    })),
};

export default function GuncelIcerikScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const kategori = (route.params as { kategori: GuncelIcerikKategori })
    .kategori;
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [kayitlar, setKayitlar] = useState<IcerikKaydi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    FETCHERS[kategori]()
      .then(setKayitlar)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
    // Bu ekrana her zaman hub ekranindan (geri donup) tekrar navigate
    // edildigi icin kategori parametresi mount sirasinda sabit kalir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("common_back")}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t(TITLE_KEYS[kategori])}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("guncelIcerik_error")}</Text>
        )}
        {!isLoading && !error && kayitlar.length === 0 && (
          <Text style={styles.errorText}>{t("guncelIcerik_empty")}</Text>
        )}
        {!isLoading &&
          !error &&
          kayitlar.map((item) => {
            const expanded = expandedId === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setExpandedId(expanded ? null : item.id)}
                accessibilityRole="button"
              >
                <Card style={styles.card}>
                  <Text
                    style={styles.itemTitle}
                    numberOfLines={expanded ? undefined : 2}
                  >
                    {item.baslik}
                  </Text>
                  {item.icerik ? (
                    <Text
                      style={styles.itemSummary}
                      numberOfLines={expanded ? undefined : 2}
                    >
                      {item.icerik}
                    </Text>
                  ) : null}
                  <View style={styles.itemFooter}>
                    <Text style={styles.itemDate}>
                      {new Date(item.tarih).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </Text>
                    <MaterialIcons
                      name={expanded ? "expand-less" : "expand-more"}
                      size={18}
                      color={colors.secondary}
                    />
                  </View>
                </Card>
              </Pressable>
            );
          })}
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
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
    },
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
    },
    card: {
      padding: spacing.stackGap,
      gap: 4,
    },
    itemTitle: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    itemSummary: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    itemFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 4,
    },
    itemDate: {
      ...typography.labelSm,
      color: colors.secondary,
    },
  });
