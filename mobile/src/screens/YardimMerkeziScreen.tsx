import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";
import { Colors, spacing, typography, useThemeColors } from "../theme";

const soruKeys: TranslationKey[] = [
  "yardimMerkezi_q1",
  "yardimMerkezi_q2",
  "yardimMerkezi_q3",
  "yardimMerkezi_q4",
  "yardimMerkezi_q5",
];

type Props = {
  onBack: () => void;
};

export function YardimMerkeziContent({ onBack }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("common_back")}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.onBackground}
          />
        </Pressable>
        <Text style={styles.headerTitle}>{t("yardimMerkezi_title")}</Text>
        <MaterialIcons name="search" size={22} color={colors.onBackground} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          {t("yardimMerkezi_popularQuestions")}
        </Text>
        <View style={styles.list}>
          {soruKeys.map((key) => (
            <Pressable key={key} accessibilityRole="button">
              <Card style={styles.card}>
                <Text style={styles.question} numberOfLines={1}>
                  {t(key)}
                </Text>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={colors.outline}
                />
              </Card>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function YardimMerkeziScreen() {
  const navigation = useNavigation();

  return <YardimMerkeziContent onBack={() => navigation.goBack()} />;
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.containerMargin,
      paddingVertical: spacing.stackGap,
    },
    headerTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.containerMargin,
      paddingBottom: spacing.stackGap,
      gap: spacing.stackGap / 2,
    },
    sectionTitle: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    list: {
      gap: spacing.stackGap / 2,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: spacing.touchTargetMin,
      padding: spacing.stackGap,
    },
    question: {
      ...typography.bodyLg,
      color: colors.onBackground,
      flex: 1,
    },
  });
