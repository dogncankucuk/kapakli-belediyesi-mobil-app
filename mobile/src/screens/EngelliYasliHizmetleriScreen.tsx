import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ComponentProps, useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, SecondaryButton } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

type Hizmet = {
  id: string;
  icon: IconName;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
};

// kapakli.bel.tr/hizmetlerimiz/evde-bakim-hizmeti sayfasindaki gercek
// hizmet kapsamindan alinmistir (2026-07-22 itibariyle).
const hizmetler: Hizmet[] = [
  {
    id: "evde-bakim",
    icon: "home",
    titleKey: "engelliYasli_evdeBakimTitle",
    descriptionKey: "engelliYasli_evdeBakimDesc",
  },
  {
    id: "sosyal-hizmetler",
    icon: "volunteer-activism",
    titleKey: "engelliYasli_sosyalHizmetlerTitle",
    descriptionKey: "engelliYasli_sosyalHizmetlerDesc",
  },
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

      <View style={styles.content}>
        <Text style={styles.subtitle}>{t("engelliYasli_subtitle")}</Text>

        {hizmetler.map((hizmet) => (
          <Card key={hizmet.id} style={styles.hizmetCard}>
            <View style={styles.hizmetIcon}>
              <MaterialIcons
                name={hizmet.icon}
                size={22}
                color={colors.onPrimary}
              />
            </View>
            <View style={styles.hizmetInfo}>
              <Text style={styles.hizmetTitle}>{t(hizmet.titleKey)}</Text>
              <Text style={styles.hizmetDescription} numberOfLines={2}>
                {t(hizmet.descriptionKey)}
              </Text>
            </View>
            <SecondaryButton
              label={t("engelliYasli_applyButton")}
              onPress={() => Linking.openURL("tel:4448059")}
              style={styles.applyButton}
            />
          </Card>
        ))}

        <Text style={styles.infoNote}>{t("engelliYasli_infoNote")}</Text>
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
      flexShrink: 1,
    },
    content: {
      flex: 1,
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
  });
