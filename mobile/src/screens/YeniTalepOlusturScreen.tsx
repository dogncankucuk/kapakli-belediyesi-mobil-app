import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createRequest } from "../api/requests";
import { TalepKategorisi } from "../api/types";
import { Card, PrimaryButton, SegmentedControl } from "../components";
import { buildTalepKategorileri } from "../constants/talepKategorileri";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";
import { takipNumarasiEkle } from "../storage/talepStorage";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

const MAX_LENGTH = 500;

const ekDosyaSecenekleri: {
  id: string;
  icon: "description" | "photo-camera" | "videocam";
  labelKey: TranslationKey;
}[] = [
  { id: "belge", icon: "description", labelKey: "yeniTalep_belgeEkle" },
  { id: "fotograf", icon: "photo-camera", labelKey: "yeniTalep_fotografEkle" },
  { id: "video", icon: "videocam", labelKey: "yeniTalep_videoEkle" },
];

export default function YeniTalepOlusturScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const talepKategorileri = useMemo(() => buildTalepKategorileri(t), [t]);
  const [kategori, setKategori] = useState<TalepKategorisi>("ariza-bakim");
  const [adSoyad, setAdSoyad] = useState("");
  const [telefon, setTelefon] = useState("");
  const [detay, setDetay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formGecerli =
    adSoyad.trim().length > 0 &&
    telefon.trim().length >= 10 &&
    detay.trim().length > 0;

  async function handleGonder() {
    if (!formGecerli) return;

    setIsSubmitting(true);
    try {
      const talep = await createRequest({
        kategori,
        aciklama: detay.trim(),
        adSoyad: adSoyad.trim(),
        telefon: telefon.trim(),
      });
      await takipNumarasiEkle(talep.id);
      Alert.alert(t("yeniTalep_successTitle"), t("yeniTalep_successMessage"));
      navigation.navigate("Taleplerim" as never);
    } catch {
      Alert.alert(t("yeniTalep_errorTitle"), t("yeniTalep_errorMessage"));
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
        <Text style={styles.headerTitle}>{t("yeniTalep_title")}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("yeniTalep_kategori")}</Text>
          <SegmentedControl
            options={talepKategorileri}
            value={kategori}
            onChange={setKategori}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t("yeniTalep_iletisimBilgileri")}
          </Text>
          <Card style={styles.contactCard}>
            <TextInput
              style={styles.input}
              placeholder={t("yeniTalep_adSoyadPlaceholder")}
              placeholderTextColor={colors.outline}
              value={adSoyad}
              onChangeText={setAdSoyad}
              accessibilityLabel={t("yeniTalep_adSoyadPlaceholder")}
            />
            <TextInput
              style={styles.input}
              placeholder={t("yeniTalep_telefonPlaceholder")}
              placeholderTextColor={colors.outline}
              value={telefon}
              onChangeText={setTelefon}
              keyboardType="phone-pad"
              accessibilityLabel={t("yeniTalep_telefonPlaceholder")}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t("yeniTalep_talepDetaylari")}
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder={t("yeniTalep_detayPlaceholder")}
            placeholderTextColor={colors.outline}
            multiline
            maxLength={MAX_LENGTH}
            value={detay}
            onChangeText={setDetay}
          />
          <Text style={styles.counter}>
            {detay.length} / {MAX_LENGTH}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("yeniTalep_ekDosyalar")}</Text>
          <View style={styles.attachmentsRow}>
            {ekDosyaSecenekleri.map((secenek) => (
              <Pressable
                key={secenek.id}
                accessibilityRole="button"
                style={styles.attachmentItem}
              >
                <View style={styles.attachmentIcon}>
                  <MaterialIcons
                    name={secenek.icon}
                    size={22}
                    color={colors.secondary}
                  />
                </View>
                <Text style={styles.attachmentLabel} numberOfLines={1}>
                  {t(secenek.labelKey)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.infoNote}>{t("yeniTalep_infoNote")}</Text>

        <PrimaryButton
          label={
            isSubmitting ? t("yeniTalep_submitting") : t("yeniTalep_submit")
          }
          onPress={handleGonder}
          disabled={isSubmitting || !formGecerli}
        />
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
    section: {
      gap: spacing.stackGap / 2,
    },
    sectionLabel: {
      ...typography.labelSm,
      color: colors.outline,
    },
    contactCard: {
      padding: spacing.stackGap,
      gap: spacing.stackGap / 2,
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
    textArea: {
      ...typography.bodyMd,
      height: 80,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: shape.rounded,
      padding: spacing.stackGap,
      color: colors.onBackground,
      textAlignVertical: "top",
    },
    counter: {
      ...typography.labelSm,
      color: colors.outline,
      alignSelf: "flex-end",
    },
    attachmentsRow: {
      flexDirection: "row",
      gap: spacing.stackGap,
    },
    attachmentItem: {
      flex: 1,
      alignItems: "center",
      gap: 4,
    },
    attachmentIcon: {
      width: spacing.touchTargetMin,
      height: spacing.touchTargetMin,
      borderRadius: shape.rounded,
      backgroundColor: colors.secondaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    attachmentLabel: {
      ...typography.labelSm,
      color: colors.onBackground,
      textAlign: "center",
    },
    infoNote: {
      ...typography.bodyMd,
      color: colors.outline,
    },
  });
