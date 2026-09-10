import { MaterialIcons } from "@expo/vector-icons";
import { ReactNode, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTranslation } from "../i18n/LocaleContext";
import { Colors, spacing, Typography, useThemeColors, useTypography } from "../theme";

type TopBarProps = {
  title: string;
  onMenuPress?: () => void;
  onBackPress?: () => void;
  rightSlot?: ReactNode;
};

export default function TopBar({
  title,
  onMenuPress,
  onBackPress,
  rightSlot,
}: TopBarProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {onBackPress ? (
          <Pressable
            onPress={onBackPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("common_back")}
            style={styles.menuButton}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={colors.onPrimary}
            />
          </Pressable>
        ) : onMenuPress ? (
          <Pressable
            onPress={onMenuPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("topBar_openMenu")}
            style={styles.menuButton}
          >
            <MaterialIcons name="menu" size={24} color={colors.onPrimary} />
          </Pressable>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {rightSlot ? <View style={styles.right}>{rightSlot}</View> : null}
    </View>
  );
}

const createStyles = (colors: Colors, typography: Typography) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.containerMargin,
      paddingVertical: spacing.stackGap,
      backgroundColor: colors.primaryContainer,
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
      flexShrink: 1,
    },
    menuButton: {
      width: spacing.touchTargetMin,
      height: spacing.touchTargetMin,
      marginLeft: -spacing.stackGap,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      ...typography.titleLg,
      color: colors.onPrimary,
      flexShrink: 1,
    },
    right: {
      flexShrink: 0,
    },
  });
