import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { Colors, useThemeColors } from "../theme";

type PaginationDotsProps = {
  count: number;
  activeIndex: number;
};

export default function PaginationDots({
  count,
  activeIndex,
}: PaginationDotsProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[styles.dot, index === activeIndex && styles.dotActive]}
        />
      ))}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.outlineVariant,
    },
    dotActive: {
      width: 16,
      backgroundColor: colors.primaryContainer,
    },
  });
