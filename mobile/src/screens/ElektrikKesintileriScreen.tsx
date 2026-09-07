import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getElektrikKesintileri } from "../api/elektrikKesintileri";
import { ElektrikKesintisi } from "../api/types";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, spacing, typography, useThemeColors } from "../theme";

export default function ElektrikKesintileriScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [kesintiler, setKesintiler] = useState<ElektrikKesintisi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getElektrikKesintileri()
      .then(setKesintiler)
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
        <Text style={styles.headerTitle}>
          {t("elektrikKesintileri_title")}
        </Text>
      </View>

      <View style={styles.content}>
        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>
            {t("elektrikKesintileri_error")}
          </Text>
        )}
        {!isLoading && !error && kesintiler.length === 0 && (
          <Text style={styles.emptyText}>
            {t("elektrikKesintileri_empty")}
          </Text>
        )}
        {!isLoading &&
          !error &&
          kesintiler.map((kesinti) => (
            <Pressable
              key={kesinti.id}
              onPress={() =>
                navigation.navigate(
                  "ElektrikKesintisiDetay",
                  { id: kesinti.id } as never,
                )
              }
              accessibilityRole="button"
            >
              {({ pressed }) => (
                <Card style={[styles.card, pressed && styles.cardPressed]}>
                  <View style={styles.row}>
                    <MaterialIcons
                      name="location-on"
                      size={18}
                      color={colors.secondary}
                    />
                    <Text style={styles.mahalle}>{kesinti.mahalle}</Text>
                  </View>
                  <Text style={styles.tarih}>
                    {new Date(kesinti.tarih).toLocaleDateString("tr-TR")}
                  </Text>
                  <Text style={styles.aciklama} numberOfLines={2}>
                    {kesinti.aciklama}
                  </Text>
                </Card>
              )}
            </Pressable>
          ))}
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
    headerTitle: {
      ...typography.titleLg,
      color: colors.onPrimary,
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
    card: {
      padding: spacing.containerMargin,
      gap: spacing.stackGap / 2,
    },
    cardPressed: {
      shadowOpacity: 0,
      elevation: 0,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
    },
    mahalle: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    tarih: {
      ...typography.bodyMd,
      color: colors.secondary,
    },
    aciklama: {
      ...typography.bodyMd,
      color: colors.outline,
    },
  });
