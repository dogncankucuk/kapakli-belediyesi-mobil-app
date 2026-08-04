import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ComponentProps, useMemo } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, PrimaryButton } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

type RandevuBirimi = {
  id: string;
  icon: IconName;
  badgeKey: TranslationKey;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  url: string;
};

// kapakli.bel.tr/hizmetlerimiz sayfalarindaki gercek birimlerden alinmistir
// (2026-07-28 itibariyle). Bu ekran bilgilendirme amaclidir - uygulama
// icinde randevu alinmaz, "Başvur" butonu ilgili belediye sayfasina yonlendirir.
const birimler: RandevuBirimi[] = [
  {
    id: "veteriner",
    icon: "pets",
    badgeKey: "randevuAl_veterinerBadge",
    titleKey: "randevuAl_veterinerTitle",
    descriptionKey: "randevuAl_veterinerDesc",
    url: "https://www.kapakli.bel.tr/hizmetlerimiz/veteriner-hizmetleri",
  },
  {
    id: "nikah-hizmetleri",
    icon: "favorite",
    badgeKey: "randevuAl_nikahBadge",
    titleKey: "randevuAl_nikahTitle",
    descriptionKey: "randevuAl_nikahDesc",
    url: "https://www.kapakli.bel.tr/hizmetlerimiz/nikah-hizmetlerimiz",
  },
  {
    id: "psikolojik-danismanlik",
    icon: "psychology",
    badgeKey: "randevuAl_psikolojikBadge",
    titleKey: "randevuAl_psikolojikTitle",
    descriptionKey: "randevuAl_psikolojikDesc",
    url: "https://www.kapakli.bel.tr/hizmetlerimiz/psikolojik-danismanlik-hizmeti",
  },
  {
    id: "sevgi-eli",
    icon: "volunteer-activism",
    badgeKey: "randevuAl_sevgiEliBadge",
    titleKey: "randevuAl_sevgiEliTitle",
    descriptionKey: "randevuAl_sevgiEliDesc",
    url: "https://www.kapakli.bel.tr/hizmetlerimiz/sevgi-eli-yardim-magazasi-hizmeti",
  },
];

export default function RandevuAlScreen() {
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
        <Text style={styles.headerTitle}>{t("randevuAl_title")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t("randevuAl_subtitle")}</Text>

        {birimler.map((birim) => (
          <Card key={birim.id} style={styles.card}>
            <View style={styles.imagePlaceholder}>
              <MaterialIcons
                name={birim.icon}
                size={32}
                color={colors.onPrimary}
              />
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t(birim.badgeKey)}</Text>
            </View>
            <Text style={styles.title}>{t(birim.titleKey)}</Text>
            <Text style={styles.description}>{t(birim.descriptionKey)}</Text>
            <PrimaryButton
              label={t("randevuAl_selectButton")}
              onPress={() => Linking.openURL(birim.url)}
            />
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
    headerTitle: {
      ...typography.titleLg,
      color: colors.onPrimary,
    },
    content: {
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
    },
    subtitle: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    card: {
      padding: spacing.stackGap,
      gap: spacing.stackGap / 2,
    },
    imagePlaceholder: {
      height: 72,
      borderRadius: shape.rounded,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    badge: {
      alignSelf: "flex-start",
      paddingHorizontal: spacing.stackGap / 2,
      paddingVertical: 4,
      borderRadius: shape.rounded,
      backgroundColor: colors.secondaryContainer,
    },
    badgeText: {
      ...typography.labelSm,
      color: colors.primaryContainer,
    },
    title: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    description: {
      ...typography.bodyMd,
      color: colors.outline,
    },
  });
