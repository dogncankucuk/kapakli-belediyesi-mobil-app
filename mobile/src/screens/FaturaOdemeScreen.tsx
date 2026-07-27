import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ComponentProps, useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";
import { Colors, spacing, typography, useThemeColors } from "../theme";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

type Institution = {
  id: string;
  icon: IconName;
  name: string;
  descriptionKey: TranslationKey;
  onPress?: () => void;
};

export default function FaturaOdemeScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const institutions: Institution[] = [
    {
      id: "teski",
      icon: "water-drop",
      name: "TESKİ",
      descriptionKey: "faturaOdeme_teskiDesc",
      onPress: () =>
        Linking.openURL("https://www.teski.gov.tr/sube/index.aspx"),
    },
    {
      id: "gazdas",
      icon: "local-fire-department",
      name: "GAZDAŞ",
      descriptionKey: "faturaOdeme_gazdasDesc",
      onPress: () =>
        Linking.openURL("https://odeme.com.tr/fatura/dogalgaz/TRAKYAGAZ"),
    },
    {
      id: "belediye-vergileri",
      icon: "receipt-long",
      name: t("faturaOdeme_vergiName"),
      descriptionKey: "faturaOdeme_vergiDesc",
      onPress: () =>
        Linking.openURL(
          "https://canli.belediye.gov.tr/vpos/debt-inquiry/natural-type-person-form?token=312d7f87-e8e6-4417-9419-77c7f40874d0",
        ),
    },
    {
      id: "trepas",
      icon: "bolt",
      name: "TREPAŞ",
      descriptionKey: "faturaOdeme_trepasDesc",
      onPress: () => Linking.openURL("https://trepas.com.tr/borc-sorgulama"),
    },
  ];

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
        <Text style={styles.headerTitle}>{t("faturaOdeme_title")}</Text>
      </View>

      <View style={styles.content}>
        <View>
          <Text style={styles.title}>{t("faturaOdeme_sectionTitle")}</Text>
          <Text style={styles.subtitle}>{t("faturaOdeme_subtitle")}</Text>
        </View>

        <View style={styles.grid}>
          {institutions.map((institution) => (
            <Pressable
              key={institution.id}
              onPress={institution.onPress}
              accessibilityRole="button"
              style={styles.gridItem}
            >
              {({ pressed }) => (
                <Card style={[styles.card, pressed && styles.cardPressed]}>
                  <View style={styles.iconCircle}>
                    <MaterialIcons
                      name={institution.icon}
                      size={24}
                      color={colors.primaryContainer}
                    />
                  </View>
                  <Text style={styles.institutionName}>{institution.name}</Text>
                  <Text style={styles.institutionDescription}>
                    {t(institution.descriptionKey)}
                  </Text>
                </Card>
              )}
            </Pressable>
          ))}

          <View style={styles.gridItem}>
            <Card style={styles.otherCard}>
              <View style={styles.iconCircle}>
                <MaterialIcons
                  name="more-horiz"
                  size={24}
                  color={colors.outline}
                />
              </View>
              <Text style={styles.otherLabel}>
                {t("faturaOdeme_otherInstitutions")}
              </Text>
            </Card>
          </View>
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
      gap: spacing.containerMargin,
    },
    title: {
      ...typography.titleLg,
      color: colors.onBackground,
    },
    subtitle: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.gridGutter,
    },
    gridItem: {
      width: "47%",
    },
    card: {
      aspectRatio: 1,
      justifyContent: "center",
      gap: spacing.stackGap / 2,
      padding: spacing.containerMargin,
    },
    cardPressed: {
      shadowOpacity: 0,
      elevation: 0,
    },
    otherCard: {
      aspectRatio: 1,
      justifyContent: "center",
      gap: spacing.stackGap / 2,
      padding: spacing.containerMargin,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderStyle: "dashed",
      shadowOpacity: 0,
      elevation: 0,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.secondaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    institutionName: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    institutionDescription: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    otherLabel: {
      ...typography.labelLg,
      color: colors.outline,
    },
  });
