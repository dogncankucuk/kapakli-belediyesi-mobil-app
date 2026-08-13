import { MaterialIcons } from "@expo/vector-icons";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  forgotPassword,
  login,
  loginWithGoogle,
  register,
  resetPassword,
} from "../api/auth";
import { GOOGLE_WEB_CLIENT_ID } from "../api/googleAuthConfig";
import { Card, PrimaryButton, SecondaryButton } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { useAppShell } from "../navigation/AppShellContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";
import { BizeUlasinContent } from "./BizeUlasinScreen";
import { YardimMerkeziContent } from "./YardimMerkeziScreen";

// Redirect'ten donuldugunde bekleyen AuthSession promise'ini tamamlar - Expo'nun
// kendi dokumantasyonunda onerilen, modul seviyesinde bir kere cagrilmasi gereken kurulum.
WebBrowser.maybeCompleteAuthSession();

// Native (Android/iOS) tarafta @react-native-google-signin/google-signin
// kullanilir - webClientId burada da GOOGLE_WEB_CLIENT_ID olmali ki donen
// idToken'in "aud" alani backend'in dogruladigi Client ID ile eslessin
// (Android/iOS Client ID'leri Google Play Services tarafindan paket adi +
// imzalama sertifikasi uzerinden otomatik eslestirilir, kodda gecmez).
// Web'de bu paketin kendi implementasyonu yok ("sponsor-only" stub), o yuzden
// web'de asagida hala expo-auth-session'in tarayici tabanli akisi kullanilir.
if (Platform.OS !== "web" && GOOGLE_WEB_CLIENT_ID) {
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
}

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

  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [fpStep, setFpStep] = useState<"request" | "reset">("request");
  const [fpIdentifier, setFpIdentifier] = useState("");
  const [fpCode, setFpCode] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpError, setFpError] = useState<string | null>(null);
  const [fpSuccess, setFpSuccess] = useState<string | null>(null);
  const [fpSubmitting, setFpSubmitting] = useState(false);

  const [googleRequest, googleResponse, promptGoogleAsync] =
    Google.useIdTokenAuthRequest({ clientId: GOOGLE_WEB_CLIENT_ID });

  const handleGoogleIdToken = async (idToken: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const { user } = await loginWithGoogle(idToken);
      enterApp(user);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("girisEkrani_googleError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (googleResponse?.type !== "success") return;
    const idToken =
      googleResponse.params?.id_token ?? googleResponse.authentication?.idToken;
    if (!idToken) return;
    // Promise.resolve().then(...) ile setState'leri effect'in senkron govdesinden
    // bir sonraki microtask'a itiyoruz (react-hooks/set-state-in-effect kurali,
    // effect govdesinde DOGRUDAN setState cagrisina izin vermiyor).
    void Promise.resolve().then(() => handleGoogleIdToken(idToken));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleResponse]);

  const handleGoogle = async () => {
    if (!GOOGLE_WEB_CLIENT_ID) {
      setError(t("girisEkrani_googleError"));
      return;
    }
    setError(null);

    if (Platform.OS === "web") {
      promptGoogleAsync();
      return;
    }

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response) && response.data.idToken) {
        await handleGoogleIdToken(response.data.idToken);
      }
    } catch (err) {
      if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      setError(t("girisEkrani_googleError"));
    }
  };

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

  const openForgotPassword = () => {
    setFpStep("request");
    setFpIdentifier(identifier);
    setFpCode("");
    setFpNewPassword("");
    setFpError(null);
    setFpSuccess(null);
    setForgotPasswordVisible(true);
  };

  const handleForgotPasswordRequest = async () => {
    setFpError(null);
    setFpSubmitting(true);
    try {
      await forgotPassword(fpIdentifier.trim());
      setFpStep("reset");
    } catch (err) {
      setFpError(
        err instanceof Error ? err.message : t("forgotPassword_genericError"),
      );
    } finally {
      setFpSubmitting(false);
    }
  };

  const handleForgotPasswordReset = async () => {
    setFpError(null);
    setFpSubmitting(true);
    try {
      await resetPassword(fpIdentifier.trim(), fpCode.trim(), fpNewPassword);
      setFpSuccess(t("forgotPassword_successMessage"));
    } catch (err) {
      setFpError(
        err instanceof Error ? err.message : t("forgotPassword_genericError"),
      );
    } finally {
      setFpSubmitting(false);
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
              <Pressable
                onPress={openForgotPassword}
                hitSlop={8}
                accessibilityRole="button"
                style={styles.forgotPasswordLink}
              >
                <Text style={styles.footerLink}>
                  {t("girisEkrani_forgotPassword")}
                </Text>
              </Pressable>
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
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t("girisEkrani_or")}</Text>
                <View style={styles.dividerLine} />
              </View>
              <SecondaryButton
                label={t("girisEkrani_googleButton")}
                onPress={handleGoogle}
                disabled={!googleRequest || isSubmitting}
              />
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
          onPress={() => previewApp()}
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
          <BizeUlasinContent
            onBack={() => setInfoModal(null)}
            onNavigateToMap={() => {
              setInfoModal(null);
              previewApp({ screen: "Map" });
            }}
          />
        )}
        {infoModal === "YardimMerkezi" && (
          <YardimMerkeziContent onBack={() => setInfoModal(null)} />
        )}
      </Modal>

      <Modal
        visible={forgotPasswordVisible}
        animationType="slide"
        onRequestClose={() => setForgotPasswordVisible(false)}
      >
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>{t("forgotPassword_title")}</Text>
              <Text style={styles.subtitle}>
                {fpStep === "request"
                  ? t("forgotPassword_step1Info")
                  : t("forgotPassword_step2Info")}
              </Text>
            </View>

            <Card style={styles.form}>
              {fpSuccess ? (
                <Text style={styles.label}>{fpSuccess}</Text>
              ) : fpStep === "request" ? (
                <View style={styles.field}>
                  <Text style={styles.label}>
                    {t("girisEkrani_identifierLabel")}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t("girisEkrani_identifierPlaceholder")}
                    placeholderTextColor={colors.outline}
                    autoCapitalize="none"
                    value={fpIdentifier}
                    onChangeText={setFpIdentifier}
                  />
                </View>
              ) : (
                <>
                  <View style={styles.field}>
                    <Text style={styles.label}>
                      {t("forgotPassword_codeLabel")}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t("forgotPassword_codePlaceholder")}
                      placeholderTextColor={colors.outline}
                      keyboardType="number-pad"
                      maxLength={6}
                      value={fpCode}
                      onChangeText={setFpCode}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>
                      {t("forgotPassword_newPasswordLabel")}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t("girisEkrani_passwordPlaceholderRegister")}
                      placeholderTextColor={colors.outline}
                      secureTextEntry
                      value={fpNewPassword}
                      onChangeText={setFpNewPassword}
                    />
                  </View>
                </>
              )}

              {fpError && <Text style={styles.errorText}>{fpError}</Text>}

              {!fpSuccess &&
                (fpSubmitting ? (
                  <ActivityIndicator color={colors.primaryContainer} />
                ) : (
                  <PrimaryButton
                    label={
                      fpStep === "request"
                        ? t("forgotPassword_sendCodeButton")
                        : t("forgotPassword_resetButton")
                    }
                    onPress={
                      fpStep === "request"
                        ? handleForgotPasswordRequest
                        : handleForgotPasswordReset
                    }
                  />
                ))}
            </Card>

            <SecondaryButton
              label={t("forgotPassword_backToLogin")}
              onPress={() => setForgotPasswordVisible(false)}
            />
          </View>
        </SafeAreaView>
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
    forgotPasswordLink: {
      alignSelf: "flex-end",
      minHeight: spacing.touchTargetMin,
      justifyContent: "center",
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.outlineVariant,
    },
    dividerText: {
      ...typography.labelSm,
      color: colors.outline,
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
