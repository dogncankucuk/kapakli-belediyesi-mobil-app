import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAtikIstatistik } from "../api/atikSiniflandirma";
import { AtikTaramaIstatistigi } from "../api/types";
import { Card, CategoryIconCard } from "../components";
import { ATIK_TURLERI } from "../constants/atikTurleri";
import { useTranslation } from "../i18n/LocaleContext";
import {
  atikTuruRenkleri,
  Colors,
  defaultCategoryAccent,
  shape,
  spacing,
  typography,
  useThemeColors,
} from "../theme";

const ATIK_TURU_IKONLARI: Record<string, keyof typeof MaterialIcons.glyphMap> =
  {
    "Kağıt/Karton/Plastik/Metal": "recycling",
    "Elektronik (AEEE)": "devices-other",
    Tekstil: "checkroom",
    Cam: "wine-bar",
    Pil: "battery-full",
    "Atık Getirme Merkezi": "warehouse",
    İlaç: "medication",
    "Bitkisel Yağ": "opacity",
    "Zirai İlaç Kutusu": "science",
  };

export default function AtikRehberiScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [sorgu, setSorgu] = useState("");
  const [istatistik, setIstatistik] = useState<AtikTaramaIstatistigi | null>(
    null,
  );

  useEffect(() => {
    getAtikIstatistik()
      .then(setIstatistik)
      .catch(() => {
        // Ana sayfa/rehber widget'ı için sessiz başarısızlık kabul edilebilir.
      });
  }, []);

  const filtrelenmisTurler = useMemo(() => {
    const q = sorgu.trim().toLocaleLowerCase("tr-TR");
    if (!q) return ATIK_TURLERI;
    return ATIK_TURLERI.filter((tur) =>
      tur.toLocaleLowerCase("tr-TR").includes(q),
    );
  }, [sorgu]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("common_back")}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.onBackground}
          />
        </Pressable>
        <View style={styles.headerTextColumn}>
          <Text style={styles.headerTitle}>{t("atikRehberi_title")}</Text>
          <Text style={styles.headerSubtitle}>
            {t("atikRehberi_subtitle").replace(
              "{n}",
              String(ATIK_TURLERI.length),
            )}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.searchRow}>
          <MaterialIcons name="search" size={20} color={colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("atikRehberi_searchPlaceholder")}
            placeholderTextColor={colors.outline}
            value={sorgu}
            onChangeText={setSorgu}
          />
        </View>

        <Pressable
          onPress={() => navigation.navigate("AtikSiniflandirma" as never)}
          accessibilityRole="button"
        >
          <Card style={styles.aiCard}>
            <View style={styles.aiCardText}>
              <Text style={styles.aiCardBadge}>{t("atikRehberi_aiBadge")}</Text>
              <Text style={styles.aiCardTitle}>{t("atikRehberi_aiTitle")}</Text>
              <Text style={styles.aiCardDescription}>
                {t("atikRehberi_aiDescription")}
              </Text>
            </View>
            <View style={styles.aiCardIcon}>
              <MaterialIcons
                name="photo-camera"
                size={24}
                color={colors.primaryContainer}
              />
            </View>
          </Card>
        </Pressable>

        <Text style={styles.sectionTitle}>{t("atikRehberi_kategoriler")}</Text>
        <View style={styles.grid}>
          {filtrelenmisTurler.map((tur) => (
            <CategoryIconCard
              key={tur}
              icon={ATIK_TURU_IKONLARI[tur] ?? "recycling"}
              label={tur}
              accent={atikTuruRenkleri[tur] ?? defaultCategoryAccent}
              onPress={() =>
                navigation.navigate("AtikNoktalari", {
                  initialFilter: tur,
                } as never)
              }
            />
          ))}
        </View>

        {istatistik && istatistik.taramaSayisi > 0 && (
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>{t("atikRehberi_statLabel")}</Text>
            <View style={styles.statRow}>
              <Text style={styles.statValue}>
                {`~${istatistik.tahminiKg} kg`}
              </Text>
              <Text style={styles.statHint}>{t("atikRehberi_statHint")}</Text>
            </View>
          </Card>
        )}
      </View>
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
    },
    headerTextColumn: {
      flex: 1,
    },
    headerTitle: {
      ...typography.titleLg,
      color: colors.onBackground,
    },
    headerSubtitle: {
      ...typography.labelSm,
      color: colors.outline,
    },
    content: {
      flex: 1,
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: shape.roundedLg,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      paddingHorizontal: spacing.stackGap,
      minHeight: spacing.touchTargetMin,
    },
    searchInput: {
      ...typography.bodyLg,
      color: colors.onBackground,
      flex: 1,
    },
    aiCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
      padding: spacing.containerMargin,
      backgroundColor: colors.primaryContainer,
    },
    aiCardText: {
      flex: 1,
      gap: 2,
    },
    aiCardBadge: {
      ...typography.labelSm,
      color: colors.onPrimaryContainer,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    aiCardTitle: {
      ...typography.titleMd,
      color: colors.onPrimary,
    },
    aiCardDescription: {
      ...typography.bodyMd,
      color: colors.onPrimaryContainer,
    },
    aiCardIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surfaceContainerLowest,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.gridGutter,
    },
    statCard: {
      padding: spacing.containerMargin,
      gap: 4,
    },
    statLabel: {
      ...typography.labelSm,
      color: colors.outline,
      textTransform: "uppercase",
    },
    statRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: spacing.stackGap / 2,
    },
    statValue: {
      ...typography.headlineMdMobile,
      color: colors.onBackground,
    },
    statHint: {
      ...typography.labelSm,
      color: colors.outline,
    },
  });
