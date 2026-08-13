import { useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, spacing, typography, useThemeColors } from "../theme";

const STEP_COLORS = ["#4C7A3F", "#9C7A3F", "#C97A2B", "#B3261E"];

type SeveritySliderProps = {
  labels: [string, string, string, string];
  value: number; // 0-3
  onChange: (value: number) => void;
};

export default function SeveritySlider({
  labels,
  value,
  onChange,
}: SeveritySliderProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [trackWidth, setTrackWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  // Recreated every render (cheap, plain-object PanResponder) so its
  // handlers always close over the current trackWidth/value/onChange -
  // no refs involved, which keeps this compatible with the React Compiler.
  const handleTouch = (locationX: number) => {
    if (trackWidth <= 0) return;
    const ratio = Math.max(0, Math.min(1, locationX / trackWidth));
    const next = Math.round(ratio * 3);
    if (next !== value) onChange(next);
  };
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => handleTouch(event.nativeEvent.locationX),
    onPanResponderMove: (event) => handleTouch(event.nativeEvent.locationX),
  });

  const thumbLeft = trackWidth > 0 ? (value / 3) * trackWidth : 0;

  return (
    <View>
      <View style={styles.labelsRow}>
        {labels.map((label, index) => (
          <Text
            key={label}
            style={[
              styles.stepLabel,
              index === value && styles.stepLabelActive,
            ]}
          >
            {label}
          </Text>
        ))}
      </View>
      <View
        style={styles.trackWrapper}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        <View style={styles.track}>
          {STEP_COLORS.map((color) => (
            <View
              key={color}
              style={[styles.trackSegment, { backgroundColor: color }]}
            />
          ))}
        </View>
        <View
          style={[
            styles.thumb,
            { left: thumbLeft - 11, borderColor: STEP_COLORS[value] },
          ]}
        />
      </View>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    labelsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.stackGap / 2,
    },
    stepLabel: {
      ...typography.labelSm,
      color: colors.outline,
    },
    stepLabelActive: {
      color: colors.onBackground,
      fontWeight: "700",
    },
    trackWrapper: {
      height: 32,
      justifyContent: "center",
    },
    track: {
      flexDirection: "row",
      height: 6,
      borderRadius: 3,
      overflow: "hidden",
    },
    trackSegment: {
      flex: 1,
    },
    thumb: {
      position: "absolute",
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
  });
