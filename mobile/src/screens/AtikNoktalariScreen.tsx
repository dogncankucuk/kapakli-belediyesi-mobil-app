import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAtikNoktalari } from "../api/atikNoktalari";
import { AtikNoktasi, AtikTuru } from "../api/types";
import { Card } from "../components";
import { ATIK_TURLERI } from "../constants/atikTurleri";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

type FilterValue = "hepsi" | AtikTuru;

export default function AtikNoktalariScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const initialFilter = (
    route.params as { initialFilter?: FilterValue } | undefined
  )?.initialFilter;
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [noktalar, setNoktalar] = useState<AtikNoktasi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<FilterValue>(initialFilter ?? "hepsi");

  useEffect(() => {
    getAtikNoktalari()
      .then(setNoktalar)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      filter === "hepsi"
        ? noktalar
        : noktalar.filter((nokta) => nokta.tur === filter),
    [noktalar, filter],
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
        <Text style={styles.headerTitle}>{t("atik_title")}</Text>
      </View>

      <View style={styles.summary}>
        <MaterialIcons name="recycling" size={28} color={colors.secondary} />
        <Text style={styles.summaryText}>
          {t("atik_summary").replace("{count}", String(noktalar.length))}
        </Text>
      </View>

      <Pressable
        onPress={() => navigation.navigate("AtikSiniflandirma" as never)}
        accessibilityRole="button"
        accessibilityLabel={t("atik_aiButton")}
        style={styles.aiButton}
      >
        <MaterialIcons name="photo-camera" size={22} color={colors.onPrimary} />
        <Text style={styles.aiButtonText}>{t("atik_aiButton")}</Text>
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterWrapper}
      >
        <Pressable
          onPress={() => setFilter("hepsi")}
          accessibilityRole="button"
          accessibilityState={{ selected: filter === "hepsi" }}
          style={[styles.chip, filter === "hepsi" && styles.chipActive]}
        >
          <Text
            style={[
              styles.chipLabel,
              filter === "hepsi" && styles.chipLabelActive,
            ]}
          >
            {t("atik_filterAll")}
          </Text>
        </Pressable>
        {ATIK_TURLERI.map((tur) => {
          const isActive = filter === tur;
          return (
            <Pressable
              key={tur}
              onPress={() => setFilter(tur)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text
                style={[styles.chipLabel, isActive && styles.chipLabelActive]}
                numberOfLines={1}
              >
                {tur}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator
          color={colors.primaryContainer}
          style={styles.loading}
        />
      ) : null}
      {!isLoading && error ? (
        <Text style={styles.errorText}>{t("atik_error")}</Text>
      ) : null}
      {!isLoading && !error && filtered.length === 0 ? (
        <Text style={styles.emptyText}>{t("atik_empty")}</Text>
      ) : null}

      {!isLoading && !error ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate("Map", {
                  initialTab: "atikNoktalari",
                  focusId: `atik-${item.id}`,
                } as never)
              }
              accessibilityRole="button"
              accessibilityLabel={item.ad}
            >
              <Card style={styles.card}>
                <View style={styles.icon}>
                  <MaterialIcons
                    name="recycling"
                    size={20}
                    color={colors.onPrimary}
                  />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.ad}
                  </Text>
                  <Text style={styles.tur} numberOfLines={1}>
                    {item.tur}
                    {item.adres ? ` · ${item.adres}` : ""}
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={22}
                  color={colors.outline}
                />
              </Card>
            </Pressable>
          )}
        />
      ) : null}
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
    },
    summary: {
      minHeight: 72,
      marginHorizontal: spacing.containerMargin,
      marginTop: spacing.containerMargin,
      borderRadius: shape.rounded,
      backgroundColor: colors.outlineVariant,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.stackGap / 2,
      paddingHorizontal: spacing.stackGap,
    },
    summaryText: {
      ...typography.labelLg,
      color: colors.onBackground,
      flexShrink: 1,
    },
    aiButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.stackGap / 2,
      minHeight: spacing.touchTargetMin,
      marginHorizontal: spacing.containerMargin,
      marginTop: spacing.stackGap,
      borderRadius: shape.rounded,
      backgroundColor: colors.primaryContainer,
    },
    aiButtonText: {
      ...typography.labelLg,
      color: colors.onPrimary,
    },
    filterScroll: {
      flexGrow: 0,
    },
    filterWrapper: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: spacing.containerMargin,
      paddingVertical: spacing.stackGap,
    },
    chip: {
      minHeight: spacing.touchTargetMin - 8,
      justifyContent: "center",
      borderRadius: 999,
      paddingHorizontal: spacing.stackGap + 4,
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    chipActive: {
      backgroundColor: colors.primaryContainer,
      borderColor: colors.primaryContainer,
    },
    chipLabel: {
      ...typography.labelSm,
      color: colors.onBackground,
    },
    chipLabelActive: {
      color: colors.onPrimary,
    },
    loading: {
      marginTop: spacing.containerMargin,
    },
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
      paddingHorizontal: spacing.containerMargin,
    },
    emptyText: {
      ...typography.bodyMd,
      color: colors.outline,
      paddingHorizontal: spacing.containerMargin,
    },
    list: {
      paddingHorizontal: spacing.containerMargin,
      paddingBottom: spacing.stackGap,
      gap: spacing.stackGap / 2,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
      padding: spacing.stackGap,
    },
    icon: {
      width: 36,
      height: 36,
      borderRadius: shape.rounded,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    cardText: {
      flex: 1,
      gap: 2,
    },
    name: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    tur: {
      ...typography.bodyMd,
      color: colors.outline,
    },
  });
