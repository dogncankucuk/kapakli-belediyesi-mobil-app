import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createAseviBasvuru } from "../api/asevi";
import { getOnemliKurumlar } from "../api/onemliKurumlar";
import { Card, PrimaryButton, SecondaryButton } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

export default function AseviScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [adSoyad, setAdSoyad] = useState("");
  const [telefon, setTelefon] = useState("");
  const [adres, setAdres] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  async function handleHaritadaGor() {
    if (isLocating) return;
    setIsLocating(true);
    try {
      const kurumlar = await getOnemliKurumlar();
      const asevi = kurumlar.find((kurum) => kurum.tur === "Aşevi");
      if (asevi) {
        navigation.navigate("Map", {
          initialTab: "kurumlar",
          focusId: `kurum-${asevi.id}`,
        } as never);
      } else {
        navigation.navigate("Map" as never);
      }
    } catch {
      navigation.navigate("Map" as never);
    } finally {
      setIsLocating(false);
    }
  }

  const formGecerli =
    adSoyad.trim().length > 0 &&
    telefon.trim().length >= 10 &&
    adres.trim().length > 0;

  async function handleGonder() {
    if (!formGecerli) return;

    setIsSubmitting(true);
    try {
      await createAseviBasvuru({
        adSoyad: adSoyad.trim(),
        telefon: telefon.trim(),
        adres: adres.trim(),
      });
      Alert.alert(t("asevi_successTitle"), t("asevi_successMessage"));
      setAdSoyad("");
      setTelefon("");
      setAdres("");
    } catch {
      Alert.alert(t("asevi_errorTitle"), t("asevi_errorMessage"));
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
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("asevi_title")}</Text>
      </View>
      <View style={styles.content}>
        <Card style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{t("asevi_description")}</Text>
        </Card>

        <Card style={styles.form}>
          <Text style={styles.formTitle}>{t("asevi_formTitle")}</Text>
          <View style={styles.field}>
            <Text style={styles.label}>{t("asevi_adSoyadLabel")}</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={colors.outline}
              value={adSoyad}
              onChangeText={setAdSoyad}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{t("asevi_telefonLabel")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("girisEkrani_telefonPlaceholder")}
              placeholderTextColor={colors.outline}
              keyboardType="phone-pad"
              value={telefon}
              onChangeText={setTelefon}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{t("asevi_adresLabel")}</Text>
            <TextInput
              style={[styles.input, styles.adresInput]}
              placeholderTextColor={colors.outline}
              value={adres}
              onChangeText={setAdres}
              multiline
            />
          </View>
          <PrimaryButton
            label={t("asevi_submitButton")}
            onPress={handleGonder}
            disabled={!formGecerli || isSubmitting}
          />
        </Card>

        <View style={styles.infoRow}>
          <Card style={styles.infoCard}>
            <MaterialIcons
              name="location-on"
              size={18}
              color={colors.secondary}
            />
            <Text style={styles.infoText} numberOfLines={2}>
              {t("asevi_address")}
            </Text>
            <SecondaryButton
              label={t("bizeUlasin_viewOnMap")}
              onPress={handleHaritadaGor}
              disabled={isLocating}
            />
          </Card>
          <Card style={styles.infoCard}>
            <MaterialIcons name="call" size={18} color={colors.secondary} />
            <Text style={styles.infoText}>{t("asevi_applyInfo")}</Text>
            <SecondaryButton
              label={t("asevi_callButton")}
              onPress={() => Linking.openURL("tel:4448059")}
            />
          </Card>
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
      flex: 1,
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
    },
    descriptionCard: {
      padding: spacing.stackGap,
      backgroundColor: colors.primaryContainer,
    },
    descriptionText: {
      ...typography.bodyMd,
      color: colors.onPrimary,
    },
    form: {
      padding: spacing.stackGap,
      gap: spacing.stackGap,
    },
    formTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    field: {
      gap: spacing.stackGap / 2,
    },
    label: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    input: {
      ...typography.bodyLg,
      minHeight: spacing.touchTargetMin,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: shape.rounded,
      paddingHorizontal: spacing.stackGap,
      color: colors.onBackground,
    },
    adresInput: {
      minHeight: 80,
      paddingTop: spacing.stackGap / 2,
      textAlignVertical: "top",
    },
    infoRow: {
      flexDirection: "row",
      gap: spacing.gridGutter,
    },
    infoCard: {
      flex: 1,
      padding: spacing.stackGap,
      gap: 4,
    },
    infoText: {
      ...typography.bodyMd,
      color: colors.onBackground,
    },
  });
