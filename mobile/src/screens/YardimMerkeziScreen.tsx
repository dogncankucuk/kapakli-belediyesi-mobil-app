import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getYardimMerkeziSorulari, YardimMerkeziSoru } from "../api/yardimMerkezi";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, spacing, typography, useThemeColors } from "../theme";

type Props = {
  onBack: () => void;
};

export function YardimMerkeziContent({ onBack }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [sorular, setSorular] = useState<YardimMerkeziSoru[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getYardimMerkeziSorulari()
      .then(setSorular)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

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

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>
          {t("yardimMerkezi_popularQuestions")}
        </Text>
        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("yardimMerkezi_error")}</Text>
        )}
        {!isLoading && !error && sorular.length === 0 && (
          <Text style={styles.emptyText}>{t("yardimMerkezi_empty")}</Text>
        )}
        <View style={styles.list}>
          {sorular.map((item) => {
            const expanded = expandedId === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setExpandedId(expanded ? null : item.id)}
                accessibilityRole="button"
              >
                <Card style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.question} numberOfLines={expanded ? undefined : 1}>
                      {item.soru}
                    </Text>
                    <MaterialIcons
                      name={expanded ? "expand-less" : "chevron-right"}
                      size={20}
                      color={colors.outline}
                    />
                  </View>
                  {expanded && (
                    <Text style={styles.answer}>{item.cevap}</Text>
                  )}
                </Card>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
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
      flexGrow: 1,
      paddingHorizontal: spacing.containerMargin,
      paddingBottom: spacing.stackGap,
      gap: spacing.stackGap / 2,
    },
    sectionTitle: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
    },
    emptyText: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    list: {
      gap: spacing.stackGap / 2,
    },
    card: {
      padding: spacing.stackGap,
      gap: spacing.stackGap / 2,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: spacing.touchTargetMin - spacing.stackGap,
    },
    question: {
      ...typography.bodyLg,
      color: colors.onBackground,
      flex: 1,
    },
    answer: {
      ...typography.bodyMd,
      color: colors.outline,
      lineHeight: 20,
    },
  });
