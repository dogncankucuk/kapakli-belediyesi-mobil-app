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

import { FormBelgesi, getFormBelgeleri } from "../api/formlar";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

export default function FormlarVeDilekcelerScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [formlar, setFormlar] = useState<FormBelgesi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getFormBelgeleri()
      .then(setFormlar)
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
        <Text style={styles.headerTitle}>{t("formlar_title")}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>{t("formlar_subtitle")}</Text>

        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("formlar_error")}</Text>
        )}
        {!isLoading && !error && formlar.length === 0 && (
          <Text style={styles.emptyText}>{t("formlar_empty")}</Text>
        )}

        {!isLoading && !error && (
          <View style={styles.list}>
            {formlar.map((form, index) => (
              <Pressable
                key={index}
                onPress={() => Linking.openURL(form.url)}
                accessibilityRole="button"
              >
                <Card style={styles.formCard}>
                  <View style={styles.formIcon}>
                    <MaterialIcons
                      name={
                        form.kind === "belge" ? "description" : "assignment"
                      }
                      size={22}
                      color={colors.onPrimary}
                    />
                  </View>
                  <Text style={styles.formTitle} numberOfLines={2}>
                    {form.title}
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
        )}

        <Text style={styles.infoNote}>{t("formlar_infoNote")}</Text>
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
    list: {
      gap: spacing.stackGap,
    },
    formCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
      padding: spacing.stackGap,
    },
    formIcon: {
      width: 40,
      height: 40,
      borderRadius: shape.rounded,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    formTitle: {
      ...typography.labelLg,
      color: colors.onBackground,
      flex: 1,
    },
    infoNote: {
      ...typography.bodyMd,
      color: colors.outline,
    },
  });
