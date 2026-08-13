import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Colors, spacing, typography, useThemeColors } from "../theme";

type StepProgressBarProps = {
  step: number;
  totalSteps: number;
  label: string;
};

export default function StepProgressBar({
  step,
  totalSteps,
  label,
}: StepProgressBarProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const progress = Math.max(0, Math.min(1, step / totalSteps));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {`Adım ${step}/${totalSteps} · ${label}`}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { flex: progress }]} />
        <View style={{ flex: 1 - progress }} />
      </View>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      gap: spacing.stackGap / 2,
    },
    label: {
      ...typography.labelSm,
      color: colors.outline,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    track: {
      flexDirection: "row",
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.outlineVariant,
      overflow: "hidden",
    },
    fill: {
      backgroundColor: colors.primaryContainer,
      borderRadius: 2,
    },
  });
