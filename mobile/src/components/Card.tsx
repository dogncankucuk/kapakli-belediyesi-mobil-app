import { StyleSheet, View, ViewProps } from "react-native";

import { colors, shape } from "../theme";

type CardProps = ViewProps;

export default function Card({ style, ...rest }: CardProps) {
  return <View style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: shape.rounded,
    shadowColor: colors.onBackground,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
});
