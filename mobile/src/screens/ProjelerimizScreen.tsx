import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getProjelerimiz, Proje, ProjeKategorisi } from "../api/projelerimiz";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

type FilterKey = ProjeKategorisi | "tumu";

const FILTERS: { key: FilterKey; labelKey: TranslationKey }[] = [
  { key: "tumu", labelKey: "projelerimiz_all" },
  { key: "tamamlanan", labelKey: "projelerimiz_tamamlanan" },
  { key: "devamEden", labelKey: "projelerimiz_devamEden" },
  { key: "yatirim", labelKey: "projelerimiz_yatirim" },
];

export default function ProjelerimizScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [filter, setFilter] = useState<FilterKey>("tumu");
  const [projeler, setProjeler] = useState<Proje[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getProjelerimiz()
      .then(setProjeler)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const filtreliProjeler = useMemo(
    () =>
      filter === "tumu"
        ? projeler
        : projeler.filter((proje) => proje.kategori === filter),
    [projeler, filter],
  );

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
          {t("projelerimiz_title")}
        </Text>
      </View>

      <View style={styles.filterWrapper}>
        {FILTERS.map((item) => {
          const isActive = item.key === filter;
          return (
            <Pressable
              key={item.key}
              onPress={() => setFilter(item.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterLabel,
                  isActive && styles.filterLabelActive,
                ]}
                numberOfLines={1}
              >
                {t(item.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("projelerimiz_error")}</Text>
        )}
        {!isLoading && !error && filtreliProjeler.length === 0 && (
          <Text style={styles.errorText}>{t("projelerimiz_empty")}</Text>
        )}
        <View style={styles.grid}>
          {!isLoading &&
            !error &&
            filtreliProjeler.map((proje) => (
              <Pressable
                key={proje.url}
                style={styles.gridItem}
                onPress={() => Linking.openURL(proje.url)}
                accessibilityRole="button"
              >
                <Card style={styles.projeCard}>
                  <Image
                    source={{ uri: proje.imageUrl }}
                    style={styles.projeImage}
                  />
                  <Text style={styles.projeTitle} numberOfLines={2}>
                    {proje.title}
                  </Text>
                </Card>
              </Pressable>
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
    filterWrapper: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: spacing.containerMargin,
      paddingVertical: spacing.stackGap,
    },
    filterChip: {
      minHeight: spacing.touchTargetMin - 8,
      borderRadius: shape.roundedLg,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      paddingHorizontal: spacing.stackGap,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceContainerLowest,
    },
    filterChipActive: {
      backgroundColor: colors.primaryContainer,
      borderColor: colors.primaryContainer,
    },
    filterLabel: {
      ...typography.labelSm,
      color: colors.onBackground,
    },
    filterLabelActive: {
      color: colors.onPrimary,
    },
    content: {
      padding: spacing.containerMargin,
      paddingTop: 0,
      gap: spacing.stackGap,
    },
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.gridGutter,
    },
    gridItem: {
      width: "47%",
    },
    projeCard: {
      padding: spacing.stackGap / 2,
      gap: spacing.stackGap / 2,
    },
    projeImage: {
      width: "100%",
      aspectRatio: 4 / 3,
      borderRadius: shape.rounded,
      backgroundColor: colors.outlineVariant,
    },
    projeTitle: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
  });
