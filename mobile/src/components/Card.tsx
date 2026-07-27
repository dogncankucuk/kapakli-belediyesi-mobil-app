import { View, ViewProps } from "react-native";

import { shape } from "../theme";
import { useThemeColors } from "../theme/ThemeContext";

type CardProps = ViewProps;

export default function Card({ style, ...rest }: CardProps) {
  const colors = useThemeColors();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: shape.rounded,
          shadowColor: colors.onBackground,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        },
        style,
      ]}
      {...rest}
    />
  );
}
