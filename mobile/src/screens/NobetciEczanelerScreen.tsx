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

import { getNobetciEczaneler } from "../api/pharmacies";
import { Pharmacy } from "../api/types";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

const RESMI_SAYFA_URL = "https://www.kapakli.bel.tr/kapakli-nobetci-eczaneler";

// Bazi eczanelerin kendi hatti OSM'de kayitli degil - bu durumda telefon
// alaninda uzun bir aciklama cumlesi tutuluyor (bkz. seed script). Tabloda
// tek bir uzun satirin diger satirlarin dizilimini bozmamasi ve gecersiz bir
// tel: linki olusmamasi icin kisa bir goruntu metnine ve temiz bir arama
// numarasina indirgeniyor.
const CAGRI_MERKEZI_MARKER = "Cagri Merkezi";
const CAGRI_MERKEZI_NUMARASI = "4448059";

function formatTelefon(raw: string): { display: string; dial: string } {
  if (raw.includes(CAGRI_MERKEZI_MARKER)) {
    return {
      display: "444 80 59 (Çağrı Merkezi)",
      dial: CAGRI_MERKEZI_NUMARASI,
    };
  }
  return { display: raw, dial: raw };
}

export default function NobetciEczanelerScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [eczaneler, setEczaneler] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getNobetciEczaneler()
      .then(setEczaneler)
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
        <Text style={styles.headerTitle}>{t("nobetciEczaneler_title")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t("nobetciEczaneler_subtitle")}</Text>

        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("nobetciEczaneler_error")}</Text>
        )}
        {!isLoading && !error && eczaneler.length === 0 && (
          <Text style={styles.emptyText}>{t("nobetciEczaneler_empty")}</Text>
        )}

        {!isLoading && !error && eczaneler.length > 0 && (
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.tableHeaderCell, styles.colAd]}>
                {t("nobetciEczaneler_colAd")}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colTelefon]}>
                {t("nobetciEczaneler_colTelefon")}
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colAdres]}>
                {t("nobetciEczaneler_colAdres")}
              </Text>
            </View>
            {eczaneler.map((eczane, index) => {
              const telefon = formatTelefon(eczane.telefon);
              return (
                <View
                  key={eczane.id}
                  style={[
                    styles.tableRow,
                    index % 2 === 1 && styles.tableRowAlt,
                  ]}
                >
                  <Text
                    style={[
                      styles.tableCell,
                      styles.colAd,
                      styles.tableCellStrong,
                    ]}
                  >
                    {eczane.ad}
                  </Text>
                  <Pressable
                    style={styles.colTelefon}
                    onPress={() => Linking.openURL(`tel:${telefon.dial}`)}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.tableCell, styles.telefonCellText]}>
                      {telefon.display}
                    </Text>
                  </Pressable>
                  <Text style={[styles.tableCell, styles.colAdres]}>
                    {eczane.adres}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        <Pressable
          onPress={() => Linking.openURL(RESMI_SAYFA_URL)}
          accessibilityRole="button"
          style={styles.officialLinkRow}
        >
          <MaterialIcons
            name="open-in-new"
            size={16}
            color={colors.secondary}
          />
          <Text style={styles.officialLinkText}>
            {t("nobetciEczaneler_officialLink")}
          </Text>
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
    table: {
      borderRadius: shape.rounded,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      overflow: "hidden",
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainerLowest,
    },
    tableRowAlt: {
      backgroundColor: colors.background,
    },
    tableHeaderRow: {
      backgroundColor: colors.primaryContainer,
      borderBottomWidth: 0,
    },
    tableHeaderCell: {
      ...typography.labelSm,
      color: colors.onPrimary,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.4,
      paddingVertical: 10,
      paddingHorizontal: 8,
    },
    tableCell: {
      ...typography.bodyMd,
      color: colors.onBackground,
      paddingVertical: 10,
      paddingHorizontal: 8,
    },
    tableCellStrong: {
      fontWeight: "700",
    },
    telefonCellText: {
      color: colors.secondary,
      fontWeight: "600",
      textDecorationLine: "underline",
    },
    colAd: {
      flex: 1.1,
    },
    colTelefon: {
      flex: 1.2,
      justifyContent: "center",
    },
    colAdres: {
      flex: 1.4,
    },
    officialLinkRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingVertical: spacing.stackGap,
    },
    officialLinkText: {
      ...typography.bodyMd,
      color: colors.secondary,
    },
  });
