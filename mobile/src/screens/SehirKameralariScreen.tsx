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

import { getSehirKameralari } from "../api/sehirKameralari";
import { SehirKamerasi } from "../api/types";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

export default function SehirKameralariScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [cameras, setCameras] = useState<SehirKamerasi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getSehirKameralari()
      .then(setCameras)
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
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("sehirKameralari_title")}</Text>
      </View>
      <View style={styles.content}>
        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("sehirKameralari_error")}</Text>
        )}
        {!isLoading && !error && cameras.length === 0 && (
          <Text style={styles.emptyText}>{t("sehirKameralari_empty")}</Text>
        )}
        <View style={styles.grid}>
          {!isLoading &&
            !error &&
            cameras.map((camera) => (
              <Card key={camera.id} style={styles.card}>
                <View style={styles.thumbnail}>
                  <MaterialIcons
                    name={camera.online ? "videocam" : "videocam-off"}
                    size={24}
                    color={camera.online ? colors.secondary : colors.outline}
                  />
                </View>
                <Text style={styles.name} numberOfLines={1}>
                  {camera.ad}
                </Text>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: camera.online
                          ? colors.secondary
                          : colors.outline,
                      },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {camera.online
                      ? t("sehirKameralari_live")
                      : t("sehirKameralari_maintenance")}
                  </Text>
                </View>
              </Card>
            ))}
        </View>
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
    },
    content: {
      flex: 1,
      padding: spacing.containerMargin,
      gap: spacing.stackGap / 2,
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
      flex: 1,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.gridGutter,
    },
    card: {
      width: "47%",
      padding: spacing.stackGap,
      gap: 4,
    },
    thumbnail: {
      height: 64,
      borderRadius: shape.rounded,
      backgroundColor: colors.outlineVariant,
      alignItems: "center",
      justifyContent: "center",
    },
    name: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      ...typography.labelSm,
      color: colors.outline,
    },
  });
