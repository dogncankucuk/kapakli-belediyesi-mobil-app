import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getVefatIlanlari } from "../api/vefatEdenler";
import { VefatIlani } from "../api/types";
import { Card, SegmentedControl } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, spacing, typography, useThemeColors } from "../theme";

function isToday(iso: string): boolean {
  const tarih = new Date(iso);
  const bugun = new Date();
  return (
    tarih.getFullYear() === bugun.getFullYear() &&
    tarih.getMonth() === bugun.getMonth() &&
    tarih.getDate() === bugun.getDate()
  );
}

export default function VefatEdenlerScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [ilanlar, setIlanlar] = useState<VefatIlani[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<"bugun" | "gecmis">("bugun");

  useEffect(() => {
    getVefatIlanlari()
      .then(setIlanlar)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const visibleIlanlar = useMemo(
    () =>
      ilanlar.filter((ilan) =>
        filter === "bugun" ? isToday(ilan.tarih) : !isToday(ilan.tarih),
      ),
    [ilanlar, filter],
  );

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
        <Text style={styles.headerTitle}>{t("vefatEdenler_title")}</Text>
        <MaterialIcons name="search" size={22} color={colors.onBackground} />
      </View>

      <View style={styles.content}>
        <SegmentedControl
          options={[
            { label: t("vefatEdenler_today"), value: "bugun" },
            { label: t("vefatEdenler_past"), value: "gecmis" },
          ]}
          value={filter}
          onChange={setFilter}
        />

        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("vefatEdenler_error")}</Text>
        )}
        {!isLoading && !error && visibleIlanlar.length === 0 && (
          <Text style={styles.emptyText}>{t("vefatEdenler_empty")}</Text>
        )}

        <View style={styles.list}>
          {!isLoading &&
            !error &&
            visibleIlanlar.map((ilan) => (
              <Card key={ilan.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <MaterialIcons
                      name="person"
                      size={20}
                      color={colors.onPrimary}
                    />
                  </View>
                  <View style={styles.nameBlock}>
                    <Text style={styles.name}>{ilan.adSoyad}</Text>
                    <Text style={styles.age}>
                      {t("vefatEdenler_age").replace("{age}", String(ilan.yas))}
                    </Text>
                  </View>
                </View>
                <Text style={styles.note} numberOfLines={1}>
                  {ilan.not}
                </Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <MaterialIcons
                      name="mosque"
                      size={14}
                      color={colors.outline}
                    />
                    <Text style={styles.metaText}>{ilan.mekan}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MaterialIcons
                      name="schedule"
                      size={14}
                      color={colors.outline}
                    />
                    <Text style={styles.metaText}>{ilan.namazVakti}</Text>
                  </View>
                </View>
              </Card>
            ))}
        </View>
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
      justifyContent: "space-between",
      paddingHorizontal: spacing.containerMargin,
      paddingVertical: spacing.stackGap,
    },
    headerTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.containerMargin,
      paddingBottom: spacing.stackGap,
      gap: spacing.stackGap,
    },
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
    },
    emptyText: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    list: {
      flex: 1,
      gap: spacing.stackGap / 2,
    },
    card: {
      flex: 1,
      padding: spacing.stackGap,
      gap: 4,
      justifyContent: "center",
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    nameBlock: {
      flex: 1,
    },
    name: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    age: {
      ...typography.labelSm,
      color: colors.outline,
    },
    note: {
      ...typography.bodyMd,
      color: colors.onBackground,
    },
    metaRow: {
      flexDirection: "row",
      gap: spacing.stackGap,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    metaText: {
      ...typography.labelSm,
      color: colors.outline,
    },
  });
