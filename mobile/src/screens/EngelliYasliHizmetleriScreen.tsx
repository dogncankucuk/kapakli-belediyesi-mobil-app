import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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

import { getBasvuruHizmetleri } from "../api/basvuruHizmetleri";
import { BasvuruHizmeti } from "../api/types";
import { Card, SecondaryButton } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

function handleApply(hizmet: BasvuruHizmeti) {
  if (hizmet.basvuruTuru === "link") {
    Linking.openURL(hizmet.basvuruDegeri);
  } else {
    Linking.openURL(`tel:${hizmet.basvuruDegeri}`);
  }
}

export default function EngelliYasliHizmetleriScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [hizmetler, setHizmetler] = useState<BasvuruHizmeti[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getBasvuruHizmetleri()
      .then(setHizmetler)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
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
        <Text style={styles.headerTitle}>{t("engelliYasli_title")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t("engelliYasli_subtitle")}</Text>

        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("engelliYasli_error")}</Text>
        )}
        {!isLoading && !error && hizmetler.length === 0 && (
          <Text style={styles.emptyText}>{t("engelliYasli_empty")}</Text>
        )}

        {!isLoading &&
          !error &&
          hizmetler.map((hizmet) => (
            <Card key={hizmet.id} style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <View style={styles.hizmetIcon}>
                  <MaterialIcons
                    name="volunteer-activism"
                    size={22}
                    color={colors.onPrimary}
                  />
                </View>
                <Text style={styles.hizmetTitle}>{hizmet.baslik}</Text>
              </View>

              <Text style={styles.detailSummary}>{hizmet.ozet}</Text>

              {hizmet.hizmetler.length > 0 && (
                <>
                  <Text style={styles.detailSectionTitle}>
                    {t("engelliYasli_servicesTitle")}
                  </Text>
                  {hizmet.hizmetler.map((item, index) => (
                    <View key={index} style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </>
              )}

              {hizmet.calismaSaatleri && (
                <Text style={styles.detailHours}>{hizmet.calismaSaatleri}</Text>
              )}

              {hizmet.kosullar.length > 0 && (
                <>
                  <Text style={styles.detailSectionTitle}>
                    {t("engelliYasli_conditionsTitle")}
                  </Text>
                  {hizmet.kosullar.map((item, index) => (
                    <View key={index} style={styles.bulletRow}>
                      <Text style={styles.numberBadge}>{index + 1}</Text>
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </>
              )}

              {hizmet.sorumluBirim && (
                <Text style={styles.detailUnit}>{hizmet.sorumluBirim}</Text>
              )}

              <SecondaryButton
                label={t("engelliYasli_applyButton")}
                onPress={() => handleApply(hizmet)}
              />
            </Card>
          ))}

        <Text style={styles.infoNote}>{t("engelliYasli_infoNote")}</Text>
        <Text style={styles.legalNote}>{t("engelliYasli_legalBasis")}</Text>
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
    headerTitle: {
      ...typography.titleLg,
      color: colors.onPrimary,
      flexShrink: 1,
    },
    content: {
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
    },
    subtitle: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
    },
    emptyText: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    hizmetIcon: {
      width: 40,
      height: 40,
      borderRadius: shape.rounded,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    infoNote: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    legalNote: {
      ...typography.labelSm,
      color: colors.outline,
    },
    detailCard: {
      padding: spacing.stackGap,
      gap: spacing.stackGap / 2,
    },
    detailHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
    },
    hizmetTitle: {
      ...typography.labelLg,
      color: colors.onBackground,
      flex: 1,
    },
    detailSummary: {
      ...typography.bodyMd,
      color: colors.onBackground,
    },
    detailSectionTitle: {
      ...typography.labelLg,
      color: colors.onBackground,
      marginTop: spacing.stackGap / 2,
    },
    bulletRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.stackGap / 2,
    },
    bulletDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 8,
      backgroundColor: colors.secondary,
    },
    bulletText: {
      ...typography.bodyMd,
      color: colors.outline,
      flex: 1,
    },
    numberBadge: {
      ...typography.labelSm,
      color: colors.onPrimary,
      backgroundColor: colors.secondary,
      width: 18,
      height: 18,
      borderRadius: 9,
      textAlign: "center",
      lineHeight: 18,
      overflow: "hidden",
    },
    detailHours: {
      ...typography.labelSm,
      color: colors.secondary,
    },
    detailUnit: {
      ...typography.labelSm,
      color: colors.outline,
      marginTop: spacing.stackGap / 2,
    },
  });
