import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ComponentProps, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createAppointment } from "../api/appointments";
import { Card, PrimaryButton, SecondaryButton } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

type RandevuKategori = {
  id: string;
  icon: IconName;
  badgeKey: TranslationKey;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
};

const kategoriler: RandevuKategori[] = [
  {
    id: "nikah-dairesi",
    icon: "favorite",
    badgeKey: "randevuAl_nikahBadge",
    titleKey: "randevuAl_nikahTitle",
    descriptionKey: "randevuAl_nikahDesc",
  },
  {
    id: "spor-salonlari",
    icon: "fitness-center",
    badgeKey: "randevuAl_sporBadge",
    titleKey: "randevuAl_sporTitle",
    descriptionKey: "randevuAl_sporDesc",
  },
];

export default function RandevuAlScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedKategori, setSelectedKategori] =
    useState<RandevuKategori | null>(null);
  const [tarih, setTarih] = useState("");
  const [saat, setSaat] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleVazgec() {
    setSelectedKategori(null);
    setTarih("");
    setSaat("");
  }

  async function handleOnayla() {
    if (!selectedKategori) {
      return;
    }
    setIsSubmitting(true);
    try {
      await createAppointment({
        hizmetTuru: t(selectedKategori.titleKey),
        tarih,
        saat,
      });
      Alert.alert(t("randevuAl_successTitle"), t("randevuAl_successMessage"));
      handleVazgec();
    } catch {
      Alert.alert(t("randevuAl_errorTitle"), t("randevuAl_errorMessage"));
    } finally {
      setIsSubmitting(false);
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
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("randevuAl_title")}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>{t("randevuAl_subtitle")}</Text>

        {!selectedKategori &&
          kategoriler.map((kategori) => (
            <Card key={kategori.id} style={styles.card}>
              <View style={styles.imagePlaceholder}>
                <MaterialIcons
                  name={kategori.icon}
                  size={32}
                  color={colors.onPrimary}
                />
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{t(kategori.badgeKey)}</Text>
              </View>
              <Text style={styles.title}>{t(kategori.titleKey)}</Text>
              <View style={styles.footer}>
                <Text style={styles.description} numberOfLines={1}>
                  {t(kategori.descriptionKey)}
                </Text>
                <PrimaryButton
                  label={t("randevuAl_selectButton")}
                  onPress={() => setSelectedKategori(kategori)}
                  style={styles.selectButton}
                />
              </View>
            </Card>
          ))}

        {selectedKategori && (
          <Card style={styles.card}>
            <Text style={styles.title}>{t(selectedKategori.titleKey)}</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t("randevuAl_dateLabel")}</Text>
              <TextInput
                style={styles.input}
                value={tarih}
                onChangeText={setTarih}
                placeholder="2026-07-20"
                placeholderTextColor={colors.outline}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t("randevuAl_timeLabel")}</Text>
              <TextInput
                style={styles.input}
                value={saat}
                onChangeText={setSaat}
                placeholder="14:30"
                placeholderTextColor={colors.outline}
              />
            </View>
            <View style={styles.formActions}>
              <SecondaryButton
                label={t("randevuAl_cancelButton")}
                onPress={handleVazgec}
                disabled={isSubmitting}
                style={styles.formButton}
              />
              <PrimaryButton
                label={t("randevuAl_confirmButton")}
                onPress={handleOnayla}
                disabled={isSubmitting || !tarih || !saat}
                style={styles.formButton}
              />
            </View>
          </Card>
        )}
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
    footer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
    },
    description: {
      ...typography.bodyMd,
      color: colors.outline,
      flex: 1,
    },
    selectButton: {
      minHeight: spacing.touchTargetMin - 8,
      paddingHorizontal: spacing.stackGap,
    },
    field: {
      gap: 4,
    },
    fieldLabel: {
      ...typography.labelSm,
      color: colors.outline,
    },
    input: {
      ...typography.bodyLg,
      color: colors.onBackground,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: shape.rounded,
      paddingHorizontal: spacing.stackGap,
      minHeight: spacing.touchTargetMin,
    },
    formActions: {
      flexDirection: "row",
      gap: spacing.stackGap,
    },
    formButton: {
      flex: 1,
    },
  });
