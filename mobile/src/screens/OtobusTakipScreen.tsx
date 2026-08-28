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

import { getCanliOtobusler, getUlasimHatlari } from "../api/ulasimHatlari";
import { CanliOtobus, UlasimHatti } from "../api/types";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, spacing, typography, useThemeColors } from "../theme";

const CANLI_POLL_MS = 15_000;

export default function OtobusTakipScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [hatlar, setHatlar] = useState<UlasimHatti[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [canliOtobusler, setCanliOtobusler] = useState<CanliOtobus[]>([]);
  const [canliLoading, setCanliLoading] = useState(false);

  useEffect(() => {
    getUlasimHatlari()
      .then(setHatlar)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!expandedId) return;

    let cancelled = false;

    function fetchCanli() {
      setCanliLoading(true);
      getCanliOtobusler(expandedId!)
        .then((items) => {
          if (!cancelled) setCanliOtobusler(items);
        })
        .catch(() => {
          if (!cancelled) setCanliOtobusler([]);
        })
        .finally(() => {
          if (!cancelled) setCanliLoading(false);
        });
    }

    fetchCanli();
    const interval = setInterval(fetchCanli, CANLI_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [expandedId]);

  function toggleExpanded(hatId: string) {
    if (expandedId === hatId) {
      setExpandedId(null);
      setCanliOtobusler([]);
    } else {
      setExpandedId(hatId);
      setCanliOtobusler([]);
    }
  }

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
        <Text style={styles.headerTitle}>{t("otobusTakip_title")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("otobusTakip_error")}</Text>
        )}
        {!isLoading && !error && hatlar.length === 0 && (
          <Text style={styles.emptyText}>{t("otobusTakip_empty")}</Text>
        )}

        {!isLoading &&
          !error &&
          hatlar.map((hat) => (
            <Card key={hat.id} style={styles.hatCard}>
              <View style={styles.hatHeader}>
                <View style={styles.hatIcon}>
                  <MaterialIcons
                    name="directions-bus"
                    size={22}
                    color={colors.onPrimary}
                  />
                </View>
                <View style={styles.hatTextGroup}>
                  <Text style={styles.hatAdi}>{hat.hatAdi}</Text>
                  <Text style={styles.hatGuzergah}>{hat.guzergah}</Text>
                </View>
              </View>

              {hat.canli && (
                <>
                  <Pressable
                    onPress={() => toggleExpanded(hat.id)}
                    accessibilityRole="button"
                    style={styles.liveButton}
                  >
                    <MaterialIcons
                      name="my-location"
                      size={18}
                      color={colors.primaryContainer}
                    />
                    <Text style={styles.liveButtonText}>
                      {expandedId === hat.id
                        ? t("otobusTakip_liveHide")
                        : t("otobusTakip_liveShow")}
                    </Text>
                  </Pressable>

                  {expandedId === hat.id && (
                    <View style={styles.liveList}>
                      {canliLoading && canliOtobusler.length === 0 && (
                        <ActivityIndicator color={colors.primaryContainer} />
                      )}
                      {!canliLoading && canliOtobusler.length === 0 && (
                        <Text style={styles.liveEmptyText}>
                          {t("otobusTakip_liveEmpty")}
                        </Text>
                      )}
                      {canliOtobusler.map((otobus) => (
                        <View key={otobus.plaka} style={styles.busRow}>
                          <MaterialIcons
                            name="directions-bus-filled"
                            size={18}
                            color={colors.outline}
                          />
                          <View style={styles.busTextGroup}>
                            <Text style={styles.busPlaka}>{otobus.plaka}</Text>
                            <Text style={styles.busMeta}>
                              {t("otobusTakip_speed")}: {Math.round(otobus.hiz)}{" "}
                              km/sa
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </Card>
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
    },
    content: {
      padding: spacing.containerMargin,
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
    hatCard: {
      padding: spacing.stackGap,
      gap: spacing.stackGap / 2,
    },
    hatHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
    },
    hatIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    hatTextGroup: {
      flex: 1,
      gap: 2,
    },
    hatAdi: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    hatGuzergah: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    hatDurum: {
      ...typography.labelSm,
      color: colors.secondary,
    },
    liveButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
      alignSelf: "flex-start",
      marginTop: spacing.stackGap / 2,
    },
    liveButtonText: {
      ...typography.labelLg,
      color: colors.primaryContainer,
    },
    liveList: {
      gap: spacing.stackGap / 2,
      marginTop: spacing.stackGap / 2,
      paddingTop: spacing.stackGap / 2,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
    },
    liveEmptyText: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    busRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
    },
    busTextGroup: {
      gap: 2,
    },
    busPlaka: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    busMeta: {
      ...typography.labelSm,
      color: colors.outline,
    },
  });
