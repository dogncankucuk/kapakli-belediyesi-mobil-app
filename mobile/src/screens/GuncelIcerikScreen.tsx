import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getGuncelIcerik,
  GuncelIcerikKategori,
  GuncelIcerikKaydi,
} from "../api/guncelIcerik";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";
import { Colors, spacing, typography, useThemeColors } from "../theme";

const TITLE_KEYS: Record<GuncelIcerikKategori, TranslationKey> = {
  haberler: "guncel_haberler",
  duyurular: "guncel_duyurular",
  ilanlar: "guncel_ilanlar",
  ihaleler: "guncel_ihaleler",
  makaleler: "guncel_makaleler",
};

export default function GuncelIcerikScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const kategori = (route.params as { kategori: GuncelIcerikKategori })
    .kategori;
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [kayitlar, setKayitlar] = useState<GuncelIcerikKaydi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getGuncelIcerik(kategori)
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
          kayitlar.map((item) => (
            <Pressable
              key={item.url}
              onPress={() => Linking.openURL(item.url)}
              accessibilityRole="button"
            >
              <Card style={styles.card}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.summary ? (
                  <Text style={styles.itemSummary} numberOfLines={2}>
                    {item.summary}
                  </Text>
                ) : null}
                <View style={styles.itemFooter}>
                  <Text style={styles.itemDate}>{item.date}</Text>
                  <MaterialIcons
                    name="open-in-new"
                    size={18}
                    color={colors.secondary}
                  />
                </View>
              </Card>
            </Pressable>
          ))}
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
