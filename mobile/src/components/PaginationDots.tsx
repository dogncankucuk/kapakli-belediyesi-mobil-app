import { StyleSheet, View } from "react-native";

import { colors } from "../theme";

type PaginationDotsProps = {
  count: number;
  activeIndex: number;
};

export default function PaginationDots({
  count,
  activeIndex,
}: PaginationDotsProps) {
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

const styles = StyleSheet.create({
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
