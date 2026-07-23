import {
  Pressable,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
} from "react-native";

import { colors, shape, spacing, typography } from "../theme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({
  label,
  onPress,
  disabled,
  style,
}: PrimaryButtonProps) {
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

const styles = StyleSheet.create({
  button: {
    minHeight: spacing.touchTargetMin,
    borderRadius: shape.roundedLg,
    backgroundColor: colors.onTertiaryContainer,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.containerMargin,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.labelLg,
    color: colors.onTertiary,
  },
});
