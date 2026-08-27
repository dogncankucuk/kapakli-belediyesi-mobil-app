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

import { getBasvuruTurleri } from "../api/basvurular";
import { BasvuruTuru } from "../api/types";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

export default function RandevuAlScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [turler, setTurler] = useState<BasvuruTuru[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getBasvuruTurleri()
      .then(setTurler)
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
        <Text style={styles.headerTitle}>{t("randevuAl_title")}</Text>
        <Pressable
          onPress={() => navigation.navigate("Basvurularim" as never)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("randevuAl_myApplications")}
          style={styles.myApplicationsButton}
        >
          <MaterialIcons name="list-alt" size={24} color={colors.onPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t("randevuAl_subtitle")}</Text>

        {isLoading && (
          <ActivityIndicator color={colors.primaryContainer} />
        )}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("randevuAl_error")}</Text>
        )}
        {!isLoading && !error && turler.length === 0 && (
          <Text style={styles.emptyText}>{t("randevuAl_empty")}</Text>
        )}

        {!isLoading &&
          !error &&
          turler.map((tur) => (
            <Pressable
              key={tur.id}
              onPress={() =>
                navigation.navigate("BasvuruForm", { basvuruTuru: tur } as never)
              }
              accessibilityRole="button"
              accessibilityLabel={tur.baslik}
            >
              <Card style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.iconBox}>
                    <MaterialIcons
                      name="description"
                      size={20}
                      color={colors.onPrimary}
                    />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.title}>{tur.baslik}</Text>
                    {tur.aciklama ? (
                      <Text style={styles.description} numberOfLines={2}>
                        {tur.aciklama}
                      </Text>
                    ) : null}
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={22}
                    color={colors.outline}
                  />
                </View>
              </Card>
            </Pressable>
          ))}
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
      flex: 1,
    },
    myApplicationsButton: {
      marginLeft: "auto",
    },
    content: {
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
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
    card: {
      padding: spacing.stackGap,
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: shape.rounded,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    cardText: {
      flex: 1,
      gap: 2,
    },
    title: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    description: {
      ...typography.bodyMd,
      color: colors.outline,
    },
  });
