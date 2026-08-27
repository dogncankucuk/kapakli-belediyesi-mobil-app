import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BasvuruTuru } from "../api/types";
import { Card, PrimaryButton } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

export default function BasvuruTuruDetayScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { basvuruTuru: tur } = route.params as { basvuruTuru: BasvuruTuru };
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
          {tur.baslik}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {tur.gorselUrl ? (
          <Image
            source={{ uri: tur.gorselUrl }}
            style={styles.banner}
            resizeMode="cover"
          />
        ) : null}

        {tur.aciklama ? (
          <Text style={styles.description}>{tur.aciklama}</Text>
        ) : null}

        {tur.gerekliBelgeler.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("basvuruTuruDetay_gerekliBelgeler")}
            </Text>
            {tur.gerekliBelgeler.map((belge) => (
              <View key={belge.etiket} style={styles.listRow}>
                <MaterialIcons
                  name="description"
                  size={18}
                  color={colors.outline}
                />
                <View style={styles.listRowText}>
                  <Text style={styles.listRowLabel}>{belge.etiket}</Text>
                  {belge.aciklama ? (
                    <Text style={styles.listRowHint}>{belge.aciklama}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </Card>
        )}

        {tur.ekBilgiAlanlari.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("basvuruTuruDetay_istenenBilgiler")}
            </Text>
            {tur.ekBilgiAlanlari.map((alan) => (
              <View key={alan.etiket} style={styles.listRow}>
                <MaterialIcons
                  name="edit-note"
                  size={18}
                  color={colors.outline}
                />
                <Text style={[styles.listRowLabel, styles.listRowText]}>
                  {alan.etiket}
                  {alan.zorunlu ? " *" : ""}
                </Text>
              </View>
            ))}
          </Card>
        )}

        <PrimaryButton
          label={t("basvuruTuruDetay_basvurButton")}
          onPress={() =>
            navigation.navigate("BasvuruForm", { basvuruTuru: tur } as never)
          }
        />
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
      flex: 1,
    },
    content: {
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
      paddingBottom: spacing.containerMargin * 2,
    },
    banner: {
      width: "100%",
      height: 180,
      borderRadius: shape.roundedLg,
    },
    description: {
      ...typography.bodyMd,
      color: colors.onBackground,
    },
    section: {
      padding: spacing.stackGap,
      gap: spacing.stackGap,
    },
    sectionTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    listRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.stackGap / 2,
    },
    listRowText: {
      flex: 1,
      gap: 2,
    },
    listRowLabel: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    listRowHint: {
      ...typography.labelSm,
      color: colors.outline,
    },
  });
