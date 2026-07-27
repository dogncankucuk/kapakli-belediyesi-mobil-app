import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BaskanBilgisi, getBaskanBilgisi } from "../api/baskan";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

export default function BaskanScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [bilgi, setBilgi] = useState<BaskanBilgisi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getBaskanBilgisi()
      .then(setBilgi)
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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t("baskan_title")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && (error || !bilgi) && (
          <Text style={styles.errorText}>{t("baskan_error")}</Text>
        )}
        {!isLoading && bilgi && (
          <>
            {bilgi.photoUrl && (
              <Image source={{ uri: bilgi.photoUrl }} style={styles.photo} />
            )}
            <Text style={styles.name}>{bilgi.name}</Text>
            {bilgi.introText ? (
              <Text style={styles.paragraph}>{bilgi.introText}</Text>
            ) : null}

            {bilgi.maddeler.length > 0 && (
              <View style={styles.bioSection}>
                <Text style={styles.sectionTitle}>{t("baskan_bioTitle")}</Text>
                <View style={styles.bulletList}>
                  {bilgi.maddeler.map((madde, index) => (
                    <View key={index} style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.bulletText}>{madde}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {bilgi.kapanisText ? (
              <Text style={styles.paragraph}>{bilgi.kapanisText}</Text>
            ) : null}
          </>
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
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
    },
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
    },
    photo: {
      width: "100%",
      aspectRatio: 4 / 5,
      borderRadius: shape.rounded,
      backgroundColor: colors.outlineVariant,
    },
    name: {
      ...typography.titleLg,
      color: colors.onBackground,
    },
    paragraph: {
      ...typography.bodyMd,
      color: colors.onBackground,
      lineHeight: 22,
    },
    bioSection: {
      gap: spacing.stackGap / 2,
    },
    sectionTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    bulletList: {
      gap: spacing.stackGap / 2,
    },
    bulletRow: {
      flexDirection: "row",
      gap: spacing.stackGap / 2,
    },
    bulletDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 8,
      backgroundColor: colors.secondary,
    },
    bulletText: {
      ...typography.bodyMd,
      color: colors.onBackground,
      flex: 1,
      lineHeight: 22,
    },
  });
