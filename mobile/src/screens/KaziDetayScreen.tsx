import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getKaziCalismalari } from "../api/kaziCalismalari";
import { Kazi } from "../api/types";
import { Card, ZenginMetinGoster } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, spacing, Typography, useThemeColors, useTypography } from "../theme";

export default function KaziDetayScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string };
  const { t } = useTranslation();
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  const [kazi, setKazi] = useState<Kazi | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getKaziCalismalari()
      .then((liste) => setKazi(liste.find((item) => item.id === id) ?? null))
      .catch(() => setKazi(null))
      .finally(() => setIsLoading(false));
  }, [id]);

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
          {t("kaziDetay_title")}
        </Text>
      </View>
      <View style={styles.content}>
        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}

        {!isLoading && !kazi && (
          <Text style={styles.emptyText}>{t("common_recordNotFound")}</Text>
        )}

        {!isLoading && kazi && (
          <Card style={styles.card}>
            <View style={styles.row}>
              <MaterialIcons
                name="location-on"
                size={18}
                color={colors.secondary}
              />
              <Text style={styles.rowText}>{kazi.mahalle}</Text>
            </View>
            <View style={styles.row}>
              <MaterialIcons name="event" size={18} color={colors.secondary} />
              <Text style={styles.rowText}>
                {new Date(kazi.baslangicTarihi).toLocaleDateString("tr-TR")}
              </Text>
            </View>
            <View style={styles.row}>
              <MaterialIcons
                name="hourglass-empty"
                size={18}
                color={colors.secondary}
              />
              <Text style={styles.rowText}>
                {t("kaziDetay_sureGun").replace("{gun}", String(kazi.sureGun))}
              </Text>
            </View>
            <View style={styles.row}>
              <MaterialIcons
                name="schedule"
                size={18}
                color={colors.secondary}
              />
              <Text style={styles.rowText}>{kazi.saat}</Text>
            </View>
            <ZenginMetinGoster html={kazi.aciklama} />
          </Card>
        )}
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
      flex: 1,
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
    },
    emptyText: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    card: {
      padding: spacing.containerMargin,
      gap: spacing.stackGap / 2,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
    },
    rowText: {
      ...typography.bodyMd,
      color: colors.onBackground,
    },
    description: {
      ...typography.bodyMd,
      color: colors.outline,
      marginTop: spacing.stackGap / 2,
    },
  });
