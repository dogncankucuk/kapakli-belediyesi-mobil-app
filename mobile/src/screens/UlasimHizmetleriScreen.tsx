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

import { getUlasimHizmetleri } from "../api/ulasimHizmetleri";
import { UlasimSecenegi } from "../api/types";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, spacing, typography, useThemeColors } from "../theme";

export default function UlasimHizmetleriScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [secenekler, setSecenekler] = useState<UlasimSecenegi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getUlasimHizmetleri()
      .then(setSecenekler)
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
        <Text style={styles.headerTitle}>{t("ulasim_title")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("ulasim_error")}</Text>
        )}

        {!isLoading &&
          !error &&
          secenekler.map((secenek) => (
            <Pressable
              key={secenek.id}
              onPress={() => Linking.openURL(secenek.url)}
              accessibilityRole="button"
            >
              <Card style={styles.optionCard}>
                <View style={styles.iconCircle}>
                  <MaterialIcons
                    name="account-balance-wallet"
                    size={26}
                    color={colors.onPrimary}
                  />
                </View>
                <View style={styles.optionTextGroup}>
                  <Text style={styles.optionTitle}>{secenek.baslik}</Text>
                  <Text style={styles.optionSubtitle}>
                    {secenek.aciklama}
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={colors.outline}
                />
              </Card>
            </Pressable>
          ))}

        <Pressable
          onPress={() => navigation.navigate("OtobusTakip" as never)}
          accessibilityRole="button"
        >
          <Card style={styles.optionCard}>
            <View style={styles.iconCircle}>
              <MaterialIcons
                name="directions-bus"
                size={26}
                color={colors.onPrimary}
              />
            </View>
            <View style={styles.optionTextGroup}>
              <Text style={styles.optionTitle}>{t("ulasim_busTitle")}</Text>
              <Text style={styles.optionSubtitle}>
                {t("ulasim_busSubtitle")}
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={colors.outline}
            />
          </Card>
        </Pressable>
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
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
    },
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
    },
    optionCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
      padding: spacing.stackGap,
      minHeight: spacing.touchTargetMin,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    optionTextGroup: {
      flex: 1,
      gap: 2,
    },
    optionTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    optionSubtitle: {
      ...typography.bodyMd,
      color: colors.outline,
    },
  });
