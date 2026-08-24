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
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

const RESMI_SAYFA_URL = "https://www.teo.org.tr/nobetci-eczaneler";

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

function openInGoogleMaps(lat: number, lng: number) {
  Linking.openURL(
    `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
  );
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

        {!isLoading &&
          !error &&
          eczaneler.map((eczane) => {
            const telefon = formatTelefon(eczane.telefon);
            return (
              <Card key={eczane.id} style={styles.eczaneCard}>
                <Text style={styles.eczaneAdi}>{eczane.ad}</Text>

                <Pressable
                  onPress={() => Linking.openURL(`tel:${telefon.dial}`)}
                  accessibilityRole="button"
                  style={styles.infoRow}
                >
                  <MaterialIcons
                    name="phone"
                    size={16}
                    color={colors.secondary}
                  />
                  <Text style={styles.telefonText}>{telefon.display}</Text>
                </Pressable>

                <View style={styles.infoRow}>
                  <MaterialIcons
                    name="home"
                    size={16}
                    color={colors.outline}
                  />
                  <Text style={styles.adresText}>{eczane.adres}</Text>
                </View>

                {eczane.adresTarifi && (
                  <View style={styles.infoRow}>
                    <MaterialIcons
                      name="info-outline"
                      size={16}
                      color={colors.outline}
                    />
                    <Text style={styles.adresTarifiText}>
                      {eczane.adresTarifi}
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={() => openInGoogleMaps(eczane.lat, eczane.lng)}
                  accessibilityRole="button"
                  style={styles.konumButton}
                >
                  <MaterialIcons
                    name="location-on"
                    size={18}
                    color={colors.primaryContainer}
                  />
                  <Text style={styles.konumButtonText}>
                    {t("nobetciEczaneler_konumButton")}
                  </Text>
                </Pressable>
              </Card>
            );
          })}

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
    eczaneCard: {
      padding: spacing.stackGap,
      gap: spacing.stackGap / 2,
    },
    eczaneAdi: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.stackGap / 2,
    },
    telefonText: {
      ...typography.bodyMd,
      color: colors.secondary,
      fontWeight: "600",
      textDecorationLine: "underline",
      flex: 1,
    },
    adresText: {
      ...typography.bodyMd,
      color: colors.onBackground,
      flex: 1,
    },
    adresTarifiText: {
      ...typography.bodyMd,
      color: colors.outline,
      flex: 1,
    },
    konumButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.stackGap / 2,
      marginTop: spacing.stackGap / 2,
      paddingVertical: 10,
      borderRadius: shape.rounded,
      backgroundColor: colors.secondaryContainer,
    },
    konumButtonText: {
      ...typography.labelLg,
      color: colors.primaryContainer,
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
