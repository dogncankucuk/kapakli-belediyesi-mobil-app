import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getFaturaOdemeKurumlari } from "../api/faturaOdeme";
import { FaturaOdemeKurumu } from "../api/types";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, spacing, typography, useThemeColors } from "../theme";

export default function FaturaOdemeScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [kurumlar, setKurumlar] = useState<FaturaOdemeKurumu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getFaturaOdemeKurumlari()
      .then(setKurumlar)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("common_back")}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("faturaOdeme_title")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.title}>{t("faturaOdeme_sectionTitle")}</Text>
          <Text style={styles.subtitle}>{t("faturaOdeme_subtitle")}</Text>
        </View>

        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("faturaOdeme_error")}</Text>
        )}
        {!isLoading && !error && kurumlar.length === 0 && (
          <Text style={styles.emptyText}>{t("faturaOdeme_empty")}</Text>
        )}

        {!isLoading && !error && kurumlar.length > 0 && (
          <View style={styles.grid}>
            {kurumlar.map((kurum) => (
              <Pressable
                key={kurum.id}
                onPress={() => Linking.openURL(kurum.url)}
                accessibilityRole="button"
                style={styles.gridItem}
              >
                {({ pressed }) => (
                  <Card style={[styles.card, pressed && styles.cardPressed]}>
                    <View style={styles.iconCircle}>
                      <MaterialIcons
                        name="receipt-long"
                        size={24}
                        color={colors.primaryContainer}
                      />
                    </View>
                    <Text style={styles.institutionName}>{kurum.ad}</Text>
                    <Text style={styles.institutionDescription}>
                      {kurum.aciklama}
                    </Text>
                  </Card>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
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
    headerTitle: {
      ...typography.titleLg,
      color: colors.onPrimary,
    },
    content: {
      padding: spacing.containerMargin,
      gap: spacing.containerMargin,
    },
    title: {
      ...typography.titleLg,
      color: colors.onBackground,
    },
    subtitle: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
    },
    emptyText: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.gridGutter,
    },
    gridItem: {
      width: "47%",
    },
    card: {
      aspectRatio: 1,
      justifyContent: "center",
      gap: spacing.stackGap / 2,
      padding: spacing.containerMargin,
    },
    cardPressed: {
      shadowOpacity: 0,
      elevation: 0,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.secondaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    institutionName: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    institutionDescription: {
      ...typography.bodyMd,
      color: colors.outline,
    },
  });
