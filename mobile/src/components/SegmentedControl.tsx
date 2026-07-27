import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

type SegmentedControlOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            style={[styles.segment, isActive && styles.segmentActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: shape.roundedLg,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: 4,
      gap: 4,
    },
    segment: {
      flex: 1,
      minHeight: spacing.touchTargetMin - 8,
      borderRadius: shape.roundedLg,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.stackGap,
    },
    segmentActive: {
      backgroundColor: colors.primaryContainer,
    },
    label: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    labelActive: {
      color: colors.onPrimary,
    },
  });
