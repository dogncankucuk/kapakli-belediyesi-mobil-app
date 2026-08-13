import { MaterialIcons } from "@expo/vector-icons";
import { ReactNode, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors, spacing, typography, useThemeColors } from "../theme";

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
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {onBackPress ? (
          <Pressable
            onPress={onBackPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Geri dön"
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
            accessibilityLabel="Menüyü aç"
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

const createStyles = (colors: Colors) =>
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
