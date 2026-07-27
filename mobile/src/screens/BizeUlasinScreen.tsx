import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, PrimaryButton } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

type Props = {
  onBack: () => void;
  onNavigateToMap?: () => void;
};

export function BizeUlasinContent({ onBack, onNavigateToMap }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("common_back")}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.onBackground}
          />
        </Pressable>
        <Text style={styles.headerTitle}>{t("bizeUlasin_title")}</Text>
        <MaterialIcons
          name="help-outline"
          size={22}
          color={colors.onBackground}
        />
      </View>

      <View style={styles.content}>
        <Pressable onPress={() => Linking.openURL("tel:4448059")}>
          <Card style={styles.callCenterCard}>
            <View style={styles.callCenterIcon}>
              <MaterialIcons name="call" size={22} color={colors.onPrimary} />
            </View>
            <View>
              <Text style={styles.callCenterLabel}>
                {t("bizeUlasin_callCenter")}
              </Text>
              <Text style={styles.callCenterNumber}>444 80 59</Text>
            </View>
          </Card>
        </Pressable>

        <View style={styles.contactRow}>
          <Pressable
            style={styles.contactCardWrapper}
            onPress={() => Linking.openURL("https://wa.me/905309556463")}
            accessibilityRole="button"
          >
            <Card style={styles.contactCard}>
              <MaterialIcons name="chat" size={22} color={colors.secondary} />
              <Text style={styles.contactLabel}>
                {t("bizeUlasin_whatsapp")}
              </Text>
            </Card>
          </Pressable>
          <Pressable
            style={styles.contactCardWrapper}
            onPress={() => Linking.openURL("mailto:kapakli@kapakli.bel.tr")}
            accessibilityRole="button"
          >
            <Card style={styles.contactCard}>
              <MaterialIcons name="mail" size={22} color={colors.secondary} />
              <Text style={styles.contactLabel}>{t("bizeUlasin_email")}</Text>
            </Card>
          </Pressable>
        </View>

        <Card style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <MaterialIcons
              name="location-on"
              size={18}
              color={colors.secondary}
            />
            <Text style={styles.addressTitle}>{t("bizeUlasin_townHall")}</Text>
          </View>
          <Text style={styles.addressText}>{t("bizeUlasin_address")}</Text>
          <View style={styles.imagePlaceholder}>
            <MaterialIcons
              name="account-balance"
              size={28}
              color={colors.onPrimary}
            />
          </View>
          {onNavigateToMap && (
            <PrimaryButton
              label={t("bizeUlasin_viewOnMap")}
              onPress={onNavigateToMap}
            />
          )}
        </Card>
      </View>
    </SafeAreaView>
  );
}

export default function BizeUlasinScreen() {
  const navigation = useNavigation();

  return (
    <BizeUlasinContent
      onBack={() => navigation.goBack()}
      onNavigateToMap={() =>
        navigation.navigate("Map", { screen: "MapMain" } as never)
      }
    />
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
      justifyContent: "space-between",
      paddingHorizontal: spacing.containerMargin,
      paddingVertical: spacing.stackGap,
    },
    headerTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.containerMargin,
      paddingBottom: spacing.stackGap,
      gap: spacing.stackGap,
    },
    callCenterCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
      padding: spacing.stackGap,
      backgroundColor: colors.primaryContainer,
    },
    callCenterIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    callCenterLabel: {
      ...typography.labelSm,
      color: colors.onPrimaryContainer,
    },
    callCenterNumber: {
      ...typography.titleLg,
      color: colors.onPrimary,
    },
    contactRow: {
      flexDirection: "row",
      gap: spacing.stackGap / 2,
    },
    contactCardWrapper: {
      flex: 1,
    },
    contactCard: {
      minHeight: spacing.touchTargetMin,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      padding: spacing.stackGap,
    },
    contactLabel: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    addressCard: {
      flex: 1,
      padding: spacing.stackGap,
      gap: spacing.stackGap / 2,
    },
    addressHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
    },
    addressTitle: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    addressText: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    imagePlaceholder: {
      flex: 1,
      minHeight: 60,
      borderRadius: shape.rounded,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
  });
