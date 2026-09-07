import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getPlanliKesintiler } from "../api/suHizmetleri";
import { PlanliKesinti } from "../api/types";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, spacing, typography, useThemeColors } from "../theme";

export default function SuKesintisiDetayScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string };
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [kesinti, setKesinti] = useState<PlanliKesinti | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPlanliKesintiler()
      .then((liste) => setKesinti(liste.find((item) => item.id === id) ?? null))
      .catch(() => setKesinti(null))
      .finally(() => setIsLoading(false));
  }, [id]);

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
          Su Kesintisi
        </Text>
      </View>
      <View style={styles.content}>
        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}

        {!isLoading && !kesinti && (
          <Text style={styles.emptyText}>Kayıt bulunamadı</Text>
        )}

        {!isLoading && kesinti && (
          <Card style={styles.card}>
            <View style={styles.row}>
              <MaterialIcons
                name="location-on"
                size={18}
                color={colors.secondary}
              />
              <Text style={styles.rowText}>{kesinti.ilce}</Text>
            </View>
            <View style={styles.row}>
              <MaterialIcons name="event" size={18} color={colors.secondary} />
              <Text style={styles.rowText}>
                {new Date(kesinti.tarih).toLocaleDateString("tr-TR")}
              </Text>
            </View>
            <Text style={styles.description}>{kesinti.aciklama}</Text>
          </Card>
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
    emptyText: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    card: {
      padding: spacing.containerMargin,
      gap: spacing.stackGap / 2,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
    },
    rowText: {
      ...typography.bodyMd,
      color: colors.onBackground,
    },
    description: {
      ...typography.bodyMd,
      color: colors.outline,
      marginTop: spacing.stackGap / 2,
    },
  });
