import { MaterialIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Colors, spacing, typography, useThemeColors } from "../theme";

export type StatusStep = {
  key: string;
  label: string;
  description: string;
};

type StatusStepperProps = {
  steps: StatusStep[];
  currentIndex: number;
};

export default function StatusStepper({
  steps,
  currentIndex,
}: StatusStepperProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View>
      {steps.map((step, index) => {
        const isDone = index <= currentIndex;
        const isLast = index === steps.length - 1;
        return (
          <View key={step.key} style={styles.row}>
            <View style={styles.markerColumn}>
              <View style={[styles.marker, isDone && styles.markerDone]}>
                {isDone ? (
                  <MaterialIcons
                    name="check"
                    size={14}
                    color={colors.onPrimary}
                  />
                ) : null}
              </View>
              {!isLast ? (
                <View style={[styles.line, isDone && styles.lineDone]} />
              ) : null}
            </View>
            <View style={[styles.textColumn, !isLast && styles.textColumnGap]}>
              <Text style={[styles.stepLabel, isDone && styles.stepLabelDone]}>
                {step.label}
              </Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const MARKER_SIZE = 24;

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
    },
    markerColumn: {
      alignItems: "center",
      width: MARKER_SIZE,
    },
    marker: {
      width: MARKER_SIZE,
      height: MARKER_SIZE,
      borderRadius: MARKER_SIZE / 2,
      borderWidth: 2,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainerLowest,
      alignItems: "center",
      justifyContent: "center",
    },
    markerDone: {
      backgroundColor: colors.primaryContainer,
      borderColor: colors.primaryContainer,
    },
    line: {
      width: 2,
      flex: 1,
      minHeight: spacing.stackGap * 2,
      backgroundColor: colors.outlineVariant,
    },
    lineDone: {
      backgroundColor: colors.primaryContainer,
    },
    textColumn: {
      flex: 1,
      paddingLeft: spacing.stackGap,
      paddingTop: 2,
    },
    textColumnGap: {
      paddingBottom: spacing.stackGap,
    },
    stepLabel: {
      ...typography.labelLg,
      color: colors.outline,
    },
    stepLabelDone: {
      color: colors.onBackground,
    },
    stepDescription: {
      ...typography.bodyMd,
      color: colors.outline,
      marginTop: 2,
    },
  });
