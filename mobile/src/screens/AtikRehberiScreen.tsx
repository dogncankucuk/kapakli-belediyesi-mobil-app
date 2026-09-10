import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryIconCard } from "../components";
import { ATIK_TURLERI } from "../constants/atikTurleri";
import { useTranslation } from "../i18n/LocaleContext";
import { atikTuruRenkleri, Colors, defaultCategoryAccent, shape, spacing, Typography, useThemeColors, useTypography } from "../theme";

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
  const typography = useTypography();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  const [sorgu, setSorgu] = useState("");

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
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors, typography: Typography) =>
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
    sectionTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.gridGutter,
    },
  });
