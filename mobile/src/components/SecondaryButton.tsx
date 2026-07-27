import { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
} from "react-native";

import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function SecondaryButton({
  label,
  onPress,
  disabled,
  style,
}: SecondaryButtonProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    button: {
      minHeight: spacing.touchTargetMin,
      borderRadius: shape.roundedLg,
      borderWidth: 1,
      borderColor: colors.primaryContainer,
      backgroundColor: colors.surfaceContainerLowest,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.containerMargin,
    },
    pressed: {
      opacity: 0.7,
    },
    disabled: {
      opacity: 0.5,
    },
    label: {
      ...typography.labelLg,
      color: colors.primaryContainer,
    },
  });
