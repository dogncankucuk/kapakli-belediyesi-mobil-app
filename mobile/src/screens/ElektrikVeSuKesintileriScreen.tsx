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

import { getElektrikKesintileri } from "../api/elektrikKesintileri";
import { getPlanliKesintiler } from "../api/suHizmetleri";
import { ElektrikKesintisi, PlanliKesinti } from "../api/types";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, spacing, typography, useThemeColors } from "../theme";

export default function ElektrikVeSuKesintileriScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [suKesintileri, setSuKesintileri] = useState<PlanliKesinti[]>([]);
  const [suYukleniyor, setSuYukleniyor] = useState(true);
  const [suHata, setSuHata] = useState(false);

  const [elektrikKesintileri, setElektrikKesintileri] = useState<
    ElektrikKesintisi[]
  >([]);
  const [elektrikYukleniyor, setElektrikYukleniyor] = useState(true);
  const [elektrikHata, setElektrikHata] = useState(false);

  useEffect(() => {
    getPlanliKesintiler()
      .then(setSuKesintileri)
      .catch(() => setSuHata(true))
      .finally(() => setSuYukleniyor(false));
    getElektrikKesintileri()
      .then(setElektrikKesintileri)
      .catch(() => setElektrikHata(true))
      .finally(() => setElektrikYukleniyor(false));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("common_back")}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {t("elektrikVeSuKesintileri_title")}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons
              name="water-drop"
              size={18}
              color={colors.secondary}
            />
            <Text style={styles.sectionTitle}>
              {t("elektrikVeSuKesintileri_suBaslik")}
            </Text>
          </View>
          {suYukleniyor && (
            <ActivityIndicator color={colors.primaryContainer} />
          )}
          {!suYukleniyor && suHata && (
            <Text style={styles.errorText}>
              {t("elektrikVeSuKesintileri_hata")}
            </Text>
          )}
          {!suYukleniyor && !suHata && suKesintileri.length === 0 && (
            <Text style={styles.emptyText}>
              {t("elektrikVeSuKesintileri_bos")}
            </Text>
          )}
          {!suYukleniyor &&
            !suHata &&
            suKesintileri.map((kesinti) => (
              <Pressable
                key={kesinti.id}
                onPress={() =>
                  navigation.navigate(
                    "SuKesintisiDetay",
                    { id: kesinti.id } as never,
                  )
                }
                accessibilityRole="button"
              >
                {({ pressed }) => (
                  <Card style={[styles.card, pressed && styles.cardPressed]}>
                    <View style={styles.row}>
                      <MaterialIcons
                        name="location-on"
                        size={18}
                        color={colors.secondary}
                      />
                      <Text style={styles.mahalle}>{kesinti.ilce}</Text>
                    </View>
                    <Text style={styles.tarih}>
                      {new Date(kesinti.tarih).toLocaleDateString("tr-TR")}
                    </Text>
                    <Text style={styles.aciklama} numberOfLines={2}>
                      {kesinti.aciklama}
                    </Text>
                  </Card>
                )}
              </Pressable>
            ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="bolt" size={18} color={colors.secondary} />
            <Text style={styles.sectionTitle}>
              {t("elektrikVeSuKesintileri_elektrikBaslik")}
            </Text>
          </View>
          {elektrikYukleniyor && (
            <ActivityIndicator color={colors.primaryContainer} />
          )}
          {!elektrikYukleniyor && elektrikHata && (
            <Text style={styles.errorText}>
              {t("elektrikVeSuKesintileri_hata")}
            </Text>
          )}
          {!elektrikYukleniyor &&
            !elektrikHata &&
            elektrikKesintileri.length === 0 && (
              <Text style={styles.emptyText}>
                {t("elektrikVeSuKesintileri_bos")}
              </Text>
            )}
          {!elektrikYukleniyor &&
            !elektrikHata &&
            elektrikKesintileri.map((kesinti) => (
              <Pressable
                key={kesinti.id}
                onPress={() =>
                  navigation.navigate(
                    "ElektrikKesintisiDetay",
                    { id: kesinti.id } as never,
                  )
                }
                accessibilityRole="button"
              >
                {({ pressed }) => (
                  <Card style={[styles.card, pressed && styles.cardPressed]}>
                    <View style={styles.row}>
                      <MaterialIcons
                        name="location-on"
                        size={18}
                        color={colors.secondary}
                      />
                      <Text style={styles.mahalle}>{kesinti.mahalle}</Text>
                    </View>
                    <Text style={styles.tarih}>
                      {new Date(kesinti.tarih).toLocaleDateString("tr-TR")}
                    </Text>
                    <Text style={styles.aciklama} numberOfLines={2}>
                      {kesinti.aciklama}
                    </Text>
                  </Card>
                )}
              </Pressable>
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
      gap: spacing.stackGap,
      paddingHorizontal: spacing.containerMargin,
      paddingVertical: spacing.stackGap,
      backgroundColor: colors.primaryContainer,
    },
    headerTitle: {
      ...typography.titleLg,
      color: colors.onPrimary,
    },
    content: {
      flex: 1,
      padding: spacing.containerMargin,
      gap: spacing.stackGap * 1.5,
    },
    section: {
      gap: spacing.stackGap / 2,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
    },
    sectionTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
    },
    emptyText: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    card: {
      padding: spacing.containerMargin,
      gap: spacing.stackGap / 2,
    },
    cardPressed: {
      shadowOpacity: 0,
      elevation: 0,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
    },
    mahalle: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    tarih: {
      ...typography.bodyMd,
      color: colors.secondary,
    },
    aciklama: {
      ...typography.bodyMd,
      color: colors.outline,
    },
  });
