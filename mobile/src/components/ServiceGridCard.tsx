import { MaterialIcons } from "@expo/vector-icons";
import { ComponentProps, useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import Card from "./Card";
import { Colors, spacing, Typography, useThemeColors, useTypography } from "../theme";

type ServiceGridCardProps = {
  icon: ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  onPress?: () => void;
};

export default function ServiceGridCard({
  icon,
  label,
  onPress,
}: ServiceGridCardProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <Card style={[styles.card, pressed && styles.cardPressed]}>
          <MaterialIcons
            name={icon}
            size={28}
            color={colors.primaryContainer}
          />
          <Text style={styles.label} numberOfLines={2}>
            {label}
          </Text>
        </Card>
      )}
    </Pressable>
  );
}

const createStyles = (colors: Colors, typography: Typography) =>
  StyleSheet.create({
    card: {
      aspectRatio: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.stackGap / 2,
      padding: spacing.stackGap,
    },
    cardPressed: {
      shadowOpacity: 0,
      elevation: 0,
    },
    label: {
      ...typography.labelLg,
      color: colors.onBackground,
      textAlign: "center",
    },
  });
