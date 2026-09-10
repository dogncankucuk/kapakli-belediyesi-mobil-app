import { MaterialIcons } from "@expo/vector-icons";
import { ComponentProps, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "./Card";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";
import { useAppShell } from "../navigation/AppShellContext";
import { navigationRef } from "../navigation/navigationRef";
import { Colors, shape, spacing, Typography, useThemeColors, useTypography } from "../theme";

type SheetOption = {
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  screen: string;
};

const OPTIONS: SheetOption[] = [
  {
    labelKey: "createActionSheet_yeniTalepLabel",
    descriptionKey: "createActionSheet_yeniTalepDescription",
    icon: "post-add",
    screen: "YeniTalepOlustur",
  },
];

export default function CreateActionSheet() {
  const { isCreateSheetOpen, closeCreateSheet } = useAppShell();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );

  if (!isCreateSheetOpen) {
    return null;
  }

  const goTo = (screen: string) => {
    closeCreateSheet();
    if (navigationRef.isReady()) {
      navigationRef.navigate(screen as never);
    }
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable
        style={styles.backdrop}
        onPress={closeCreateSheet}
        accessibilityRole="button"
        accessibilityLabel={t("common_close")}
      />
      <SafeAreaView style={styles.sheet} edges={["bottom"]}>
        <View style={styles.grabber} />
        {OPTIONS.map((option) => (
          <Pressable
            key={option.screen}
            onPress={() => goTo(option.screen)}
            accessibilityRole="button"
          >
            <Card style={styles.optionCard}>
              <View style={styles.iconBox}>
                <MaterialIcons
                  name={option.icon}
                  size={24}
                  color={colors.onPrimary}
                />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{t(option.labelKey)}</Text>
                <Text style={styles.optionDescription}>
                  {t(option.descriptionKey)}
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={22}
                color={colors.outline}
              />
            </Card>
          </Pressable>
        ))}
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: Colors, typography: Typography) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: colors.onBackground,
      opacity: 0.4,
    },
    sheet: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.surfaceContainerLowest,
      borderTopLeftRadius: shape.roundedXl,
      borderTopRightRadius: shape.roundedXl,
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
    },
    grabber: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.outlineVariant,
      marginBottom: spacing.stackGap / 2,
    },
    optionCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
      padding: spacing.stackGap,
    },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: shape.rounded,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    optionText: {
      flex: 1,
    },
    optionLabel: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    optionDescription: {
      ...typography.bodyMd,
      color: colors.outline,
    },
  });
