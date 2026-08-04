import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, SecondaryButton } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

// kapakli.bel.tr/hizmetlerimiz/evde-bakim-hizmeti sayfasindaki gercek
// hizmet kapsamindan alinmistir (2026-07-28 itibariyle).
const EVDE_BAKIM_SERVICES: TranslationKey[] = [
  "engelliYasli_service1",
  "engelliYasli_service2",
  "engelliYasli_service3",
];

const EVDE_BAKIM_CONDITIONS: TranslationKey[] = [
  "engelliYasli_condition1",
  "engelliYasli_condition2",
  "engelliYasli_condition3",
  "engelliYasli_condition4",
];

export default function EngelliYasliHizmetleriScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

        <Card style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={styles.hizmetIcon}>
              <MaterialIcons name="home" size={22} color={colors.onPrimary} />
            </View>
            <Text style={styles.hizmetTitle}>
              {t("engelliYasli_evdeBakimTitle")}
            </Text>
          </View>

          <Text style={styles.detailSummary}>
            {t("engelliYasli_evdeBakimSummary")}
          </Text>

          <Text style={styles.detailSectionTitle}>
            {t("engelliYasli_servicesTitle")}
          </Text>
          {EVDE_BAKIM_SERVICES.map((key) => (
            <View key={key} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{t(key)}</Text>
            </View>
          ))}
          <Text style={styles.detailHours}>{t("engelliYasli_hours")}</Text>

          <Text style={styles.detailSectionTitle}>
            {t("engelliYasli_conditionsTitle")}
          </Text>
          {EVDE_BAKIM_CONDITIONS.map((key, index) => (
            <View key={key} style={styles.bulletRow}>
              <Text style={styles.numberBadge}>{index + 1}</Text>
              <Text style={styles.bulletText}>{t(key)}</Text>
            </View>
          ))}

          <Text style={styles.detailUnit}>
            {t("engelliYasli_responsibleUnit")}
          </Text>

          <SecondaryButton
            label={t("engelliYasli_applyButton")}
            onPress={() => Linking.openURL("tel:4448059")}
          />
        </Card>

        <Card style={styles.hizmetCard}>
          <View style={styles.hizmetIcon}>
            <MaterialIcons
              name="volunteer-activism"
              size={22}
              color={colors.onPrimary}
            />
          </View>
          <View style={styles.hizmetInfo}>
            <Text style={styles.hizmetTitle}>
              {t("engelliYasli_sosyalHizmetlerTitle")}
            </Text>
            <Text style={styles.hizmetDescription} numberOfLines={2}>
              {t("engelliYasli_sosyalHizmetlerDesc")}
            </Text>
          </View>
          <SecondaryButton
            label={t("engelliYasli_applyButton")}
            onPress={() => Linking.openURL("tel:4448059")}
            style={styles.applyButton}
          />
        </Card>

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
    hizmetCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
      padding: spacing.stackGap,
    },
    hizmetIcon: {
      width: 40,
      height: 40,
      borderRadius: shape.rounded,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    hizmetInfo: {
      flex: 1,
      gap: 2,
    },
    hizmetTitle: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    hizmetDescription: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    applyButton: {
      minHeight: spacing.touchTargetMin - 8,
      paddingHorizontal: spacing.stackGap,
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
