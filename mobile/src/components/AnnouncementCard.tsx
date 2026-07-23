import { Pressable, StyleSheet, Text, View } from "react-native";

import Card from "./Card";
import { colors, shape, spacing, typography } from "../theme";

type AnnouncementCardProps = {
  title: string;
  date: string;
  onPress?: () => void;
};

export default function AnnouncementCard({
  title,
  date,
  onPress,
}: AnnouncementCardProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <Card style={[styles.card, pressed && styles.cardPressed]}>
          <View style={styles.thumbnail} />
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.date}>{date}</Text>
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.stackGap,
    padding: spacing.stackGap,
  },
  cardPressed: {
    shadowOpacity: 0,
    elevation: 0,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: shape.rounded,
    backgroundColor: colors.outlineVariant,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.labelLg,
    color: colors.onBackground,
  },
  date: {
    ...typography.bodyMd,
    color: colors.outline,
  },
});
