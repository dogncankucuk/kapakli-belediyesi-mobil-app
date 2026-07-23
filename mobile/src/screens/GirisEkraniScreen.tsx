import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, PrimaryButton, SecondaryButton } from "../components";
import { useAppShell } from "../navigation/AppShellContext";
import { navigationRef } from "../navigation/navigationRef";
import { colors, shape, spacing, typography } from "../theme";

export default function GirisEkraniScreen() {
  const { enterApp } = useAppShell();

  // GirisEkraniScreen navigasyon agacinin DISINDA render edilir (henuz
  // enterApp() cagrilmadan), bu yuzden once uygulamaya girip sonra
  // navigationRef hazir olana kadar bekleyip ilgili ekrana yonlendiriyoruz.
  const enterAppAndGoTo = (screen: "BizeUlasin" | "YardimMerkezi") => {
    enterApp();
    const tryNavigate = () => {
      if (navigationRef.isReady()) {
        navigationRef.navigate("Profile", { screen } as never);
      } else {
        setTimeout(tryNavigate, 50);
      }
    };
    setTimeout(tryNavigate, 0);
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
          <Text style={styles.title}>
            Kapaklı Belediyesi&apos;ne Hoş Geldiniz
          </Text>
          <Text style={styles.subtitle}>Dijital belediyecilik kapınız.</Text>
        </View>

        <Card style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>T.C. Kimlik No / Telefon / E-posta</Text>
            <TextInput
              style={styles.input}
              placeholder="11 haneli T.C. numaranız"
              placeholderTextColor={colors.outline}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.outline}
              secureTextEntry
            />
          </View>
          <PrimaryButton label="Giriş Yap" onPress={enterApp} />
        </Card>

        <Text style={styles.registerText}>
          Henüz hesabınız yok mu?{" "}
          <Text style={styles.registerLink}>Kayıt Ol</Text>
        </Text>

        <SecondaryButton label="Giriş Yapmadan Devam Et" onPress={enterApp} />

        <View style={styles.footerLinks}>
          <Pressable
            onPress={() => enterAppAndGoTo("BizeUlasin")}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text style={styles.footerLink}>Bize Ulaşın</Text>
          </Pressable>
          <View style={styles.footerDivider} />
          <Pressable
            onPress={() => enterAppAndGoTo("YardimMerkezi")}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text style={styles.footerLink}>Yardım Merkezi</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
