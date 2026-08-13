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
            <View style={styles.heroCard}>
              {bilgi.photoUrl && (
                <View style={styles.photoFrameOuter}>
                  <View style={styles.photoFrameInner}>
                    <Image
                      source={{ uri: bilgi.photoUrl }}
                      style={styles.photo}
                    />
                  </View>
                  <View style={styles.photoBadge}>
                    <MaterialIcons
                      name="workspace-premium"
                      size={18}
                      color={colors.onPrimary}
                    />
                  </View>
                </View>
              )}
              <Text style={styles.name}>{bilgi.name}</Text>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <MaterialIcons
                  name="account-balance"
                  size={14}
                  color={colors.secondary}
                  style={styles.dividerIcon}
                />
                <View style={styles.dividerLine} />
              </View>
              <Text style={styles.titleBadgeText}>{t("baskan_roleLabel")}</Text>
            </View>
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
    heroCard: {
      alignItems: "center",
      gap: 4,
      paddingVertical: spacing.containerMargin * 1.5,
      paddingHorizontal: spacing.containerMargin,
      borderRadius: shape.roundedXl,
      backgroundColor: colors.secondaryContainer,
    },
    photoFrameOuter: {
      width: 168,
      height: 168,
      borderRadius: 84,
      borderWidth: 3,
      borderColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.stackGap,
      backgroundColor: colors.surfaceContainerLowest,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    photoFrameInner: {
      width: 148,
      height: 148,
      borderRadius: 74,
      borderWidth: 2,
      borderColor: colors.surfaceContainerLowest,
      overflow: "hidden",
      backgroundColor: colors.outlineVariant,
    },
    photo: {
      width: "100%",
      height: "100%",
    },
    photoBadge: {
      position: "absolute",
      bottom: 2,
      right: 2,
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryContainer,
      borderWidth: 2,
      borderColor: colors.secondaryContainer,
    },
    name: {
      ...typography.titleLg,
      color: colors.onBackground,
      textAlign: "center",
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      width: 120,
      marginTop: 2,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.outline,
      opacity: 0.5,
    },
    dividerIcon: {
      marginHorizontal: 6,
    },
    titleBadgeText: {
      ...typography.labelSm,
      color: colors.onPrimaryContainer,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginTop: 2,
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
