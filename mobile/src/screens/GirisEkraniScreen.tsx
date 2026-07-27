import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { login, register } from "../api/auth";
import { Card, PrimaryButton, SecondaryButton } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { useAppShell } from "../navigation/AppShellContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";
import { BizeUlasinContent } from "./BizeUlasinScreen";
import { YardimMerkeziContent } from "./YardimMerkeziScreen";

type InfoModal = "BizeUlasin" | "YardimMerkezi" | null;

type Mode = "giris" | "kayit";

export default function GirisEkraniScreen() {
  const { enterApp, previewApp } = useAppShell();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [mode, setMode] = useState<Mode>("giris");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<InfoModal>(null);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [ad, setAd] = useState("");
  const [soyad, setSoyad] = useState("");
  const [tcKimlikNo, setTcKimlikNo] = useState("");
  const [telefon, setTelefon] = useState("");

  const handleGiris = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const { user } = await login(identifier.trim(), password);
      enterApp(user);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("girisEkrani_loginError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKayit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const { user } = await register({
        ad: ad.trim(),
        soyad: soyad.trim(),
        tcKimlikNo: tcKimlikNo.trim(),
        telefon: telefon.trim(),
        password,
      });
      enterApp(user);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("girisEkrani_registerError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <MaterialIcons
              name="account-balance"
              size={36}
              color={colors.onPrimary}
            />
          </View>
          <Text style={styles.title}>{t("girisEkrani_welcomeTitle")}</Text>
          <Text style={styles.subtitle}>{t("girisEkrani_subtitle")}</Text>
        </View>

        <Card style={styles.form}>
          {mode === "giris" ? (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>
                  {t("girisEkrani_identifierLabel")}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={t("girisEkrani_identifierPlaceholder")}
                  placeholderTextColor={colors.outline}
                  autoCapitalize="none"
                  value={identifier}
                  onChangeText={setIdentifier}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>
                  {t("girisEkrani_passwordLabel")}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.outline}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>{t("girisEkrani_adLabel")}</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor={colors.outline}
                  value={ad}
                  onChangeText={setAd}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>{t("girisEkrani_soyadLabel")}</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor={colors.outline}
                  value={soyad}
                  onChangeText={setSoyad}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>
                  {t("girisEkrani_tcKimlikLabel")}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={t("girisEkrani_identifierPlaceholder")}
                  placeholderTextColor={colors.outline}
                  keyboardType="number-pad"
                  maxLength={11}
                  value={tcKimlikNo}
                  onChangeText={setTcKimlikNo}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>
                  {t("girisEkrani_telefonLabel")}
                </Text>
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
                <Text style={styles.label}>
                  {t("girisEkrani_passwordLabel")}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={t("girisEkrani_passwordPlaceholderRegister")}
                  placeholderTextColor={colors.outline}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          {isSubmitting ? (
            <ActivityIndicator color={colors.primaryContainer} />
          ) : (
            <PrimaryButton
              label={
                mode === "giris"
                  ? t("girisEkrani_loginButton")
                  : t("girisEkrani_registerButton")
              }
              onPress={mode === "giris" ? handleGiris : handleKayit}
            />
          )}
        </Card>

        <Pressable
          onPress={() => {
            setError(null);
            setMode(mode === "giris" ? "kayit" : "giris");
          }}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text style={styles.registerText}>
            {mode === "giris" ? (
              <>
                {t("girisEkrani_noAccountQuestion")}{" "}
                <Text style={styles.registerLink}>
                  {t("girisEkrani_registerButton")}
                </Text>
              </>
            ) : (
              <>
                {t("girisEkrani_hasAccountQuestion")}{" "}
                <Text style={styles.registerLink}>
                  {t("girisEkrani_loginButton")}
                </Text>
              </>
            )}
          </Text>
        </Pressable>

        <SecondaryButton
          label={t("girisEkrani_continueAsGuest")}
          onPress={previewApp}
        />

        <View style={styles.footerLinks}>
          <Pressable
            onPress={() => setInfoModal("BizeUlasin")}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text style={styles.footerLink}>{t("girisEkrani_contactUs")}</Text>
          </Pressable>
          <View style={styles.footerDivider} />
          <Pressable
            onPress={() => setInfoModal("YardimMerkezi")}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text style={styles.footerLink}>{t("girisEkrani_helpCenter")}</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={infoModal !== null}
        animationType="slide"
        onRequestClose={() => setInfoModal(null)}
      >
        {infoModal === "BizeUlasin" && (
          <BizeUlasinContent onBack={() => setInfoModal(null)} />
        )}
        {infoModal === "YardimMerkezi" && (
          <YardimMerkeziContent onBack={() => setInfoModal(null)} />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: spacing.containerMargin,
      justifyContent: "center",
      gap: spacing.containerMargin,
    },
    header: {
      alignItems: "center",
      gap: spacing.stackGap / 2,
    },
    logoCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.stackGap / 2,
    },
    title: {
      ...typography.titleLg,
      color: colors.onBackground,
      textAlign: "center",
    },
    subtitle: {
      ...typography.bodyMd,
      color: colors.outline,
      textAlign: "center",
    },
    form: {
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
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
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
    },
    registerText: {
      ...typography.bodyMd,
      color: colors.onBackground,
      textAlign: "center",
    },
    registerLink: {
      color: colors.onTertiaryContainer,
      fontWeight: "600",
    },
    footerLinks: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.stackGap,
    },
    footerLink: {
      ...typography.labelLg,
      color: colors.secondary,
      minHeight: spacing.touchTargetMin,
      textAlignVertical: "center",
    },
    footerDivider: {
      width: 1,
      height: 14,
      backgroundColor: colors.outlineVariant,
    },
  });
