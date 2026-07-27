import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getMeclisKararlariWeb,
  MeclisKararKaydi,
} from "../api/meclisKararlariWeb";
import { Card, SegmentedControl } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, spacing, typography, useThemeColors } from "../theme";

export default function MeclisKararlariScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [kararlar, setKararlar] = useState<MeclisKararKaydi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [year, setYear] = useState<string | null>(null);

  useEffect(() => {
    getMeclisKararlariWeb()
      .then((data) => {
        setKararlar(data);
        if (data.length > 0) {
          setYear(data[0].year);
        }
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const years = useMemo(() => {
    const uniqueYears = new Set(kararlar.map((k) => k.year));
    return Array.from(uniqueYears).sort((a, b) => Number(b) - Number(a));
  }, [kararlar]);

  const visibleKararlar = useMemo(
    () => kararlar.filter((k) => k.year === year),
    [kararlar, year],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("common_back")}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t("meclisKararlari_title")}
        </Text>
      </View>
      <View style={styles.content}>
        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("meclisKararlari_error")}</Text>
        )}
        {!isLoading && !error && kararlar.length === 0 && (
          <Text style={styles.emptyText}>{t("meclisKararlari_empty")}</Text>
        )}

        {!isLoading && !error && years.length > 0 && year && (
          <>
            <SegmentedControl
              options={years.map((y) => ({ label: y, value: y }))}
              value={year}
              onChange={setYear}
            />
            <View style={styles.list}>
              {visibleKararlar.map((item) => (
                <Pressable
                  key={item.url}
                  onPress={() => Linking.openURL(item.url)}
                  accessibilityRole="button"
                >
                  <Card style={styles.card}>
                    <Text style={styles.decisionTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <MaterialIcons
                      name="open-in-new"
                      size={20}
                      color={colors.secondary}
                    />
                  </Card>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
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
      gap: spacing.stackGap,
      paddingHorizontal: spacing.containerMargin,
      paddingVertical: spacing.stackGap,
      backgroundColor: colors.primaryContainer,
    },
    backButton: {
      width: spacing.touchTargetMin,
      height: spacing.touchTargetMin,
      marginLeft: -spacing.stackGap,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      ...typography.titleLg,
      color: colors.onPrimary,
      flexShrink: 1,
    },
    content: {
      flex: 1,
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
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
      gap: spacing.stackGap,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
      padding: spacing.stackGap,
    },
    decisionTitle: {
      ...typography.labelLg,
      color: colors.onBackground,
      flex: 1,
    },
  });
