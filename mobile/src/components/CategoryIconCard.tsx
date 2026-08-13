import { MaterialIcons } from "@expo/vector-icons";
import { ComponentProps, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Card from "./Card";
import {
  CategoryAccent,
  Colors,
  shape,
  spacing,
  typography,
  useThemeColors,
} from "../theme";

type CategoryIconCardProps = {
  icon: ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  subtitle?: string;
  accent: CategoryAccent;
  selected?: boolean;
  onPress?: () => void;
};

export default function CategoryIconCard({
  icon,
  label,
  subtitle,
  accent,
  selected,
  onPress,
}: CategoryIconCardProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={styles.flexItem}
    >
      {({ pressed }) => (
        <Card
          style={[
            styles.card,
            selected && styles.cardSelected,
            pressed && styles.cardPressed,
          ]}
        >
          {selected ? (
            <View style={styles.checkBadge}>
              <MaterialIcons name="check" size={14} color={colors.onPrimary} />
            </View>
          ) : null}
          <View style={[styles.iconBox, { backgroundColor: accent.bg }]}>
            <MaterialIcons name={icon} size={24} color={accent.icon} />
          </View>
          <Text style={styles.label} numberOfLines={2}>
            {label}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </Card>
      )}
    </Pressable>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    flexItem: {
      flexGrow: 1,
      flexBasis: "31%",
    },
    card: {
      padding: spacing.stackGap,
      borderRadius: shape.roundedLg,
      borderWidth: 1.5,
      borderColor: "transparent",
      gap: 6,
    },
    cardSelected: {
      borderColor: colors.primaryContainer,
    },
    cardPressed: {
      shadowOpacity: 0,
      elevation: 0,
    },
    checkBadge: {
      position: "absolute",
      top: spacing.stackGap / 2,
      right: spacing.stackGap / 2,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: shape.rounded,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    subtitle: {
      ...typography.labelSm,
      color: colors.outline,
    },
  });
