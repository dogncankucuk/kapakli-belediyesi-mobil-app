import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

import { getCanliOtobusler, getUlasimHatlari } from "../api/ulasimHatlari";
import { CanliOtobus, UlasimHatti } from "../api/types";
import { Card, SecondaryButton } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

const KART_BASIM_ADRESI =
  "Cumhuriyet Mah. Kapaklı Kültür Merkezi Kapaklı/Tekirdağ";
const KART_BASIM_KONUM_URL = "https://maps.app.goo.gl/vzX72kGQeBwHVmmD8";

const KART_TIPLERI = [
  {
    ad: "ANONİM ULAŞIM KARTI",
    url: "https://www.tekulas.com.tr/wp-content/uploads/2025/12/ANONIM-ULASIM-KARTI.jpg",
  },
  {
    ad: "İNDİRİMLİ ULAŞIM KARTI",
    url: "https://www.tekulas.com.tr/wp-content/uploads/2025/12/INDIRIMLI-ULASIM-KARTI.jpg",
  },
  {
    ad: "ENGELLİ REFAKATÇİ ULAŞIM KARTI",
    url: "https://www.tekulas.com.tr/wp-content/uploads/2025/12/ENGELLI-REFAKATCI-ULASIM-KARTI.jpg",
  },
  {
    ad: "65 YAŞ ÜSTÜ ULAŞIM KARTI",
    url: "https://www.tekulas.com.tr/wp-content/uploads/2025/12/65-YAS-USTU-ULASIM-KARTI.jpg",
  },
  {
    ad: "ÜCRETSİZ ULAŞIM KARTI",
    url: "https://www.tekulas.com.tr/wp-content/uploads/2025/12/UCRETSIZ-ULASIM-KARTI.jpg",
  },
  {
    ad: "2 BİNİŞLİK ULAŞIM KARTI",
    url: "https://www.tekulas.com.tr/wp-content/uploads/2025/12/2-BINISLIK-ULASIM-KARTI.jpg",
  },
  {
    ad: "TEMASSIZ BANKA KARTI, MOBİL NFC ve QR KOD",
    url: "https://www.tekulas.com.tr/wp-content/uploads/2025/12/kredikarti.png",
  },
];

const KAPAKLI_MERKEZ: [number, number] = [41.33, 27.975];
const CANLI_POLL_MS = 15_000;

const buildOtobusMapHtml = (otobusler: CanliOtobus[]) => {
  const center =
    otobusler.length > 0
      ? [otobusler[0].lat, otobusler[0].lng]
      : KAPAKLI_MERKEZ;
  const markers = otobusler
    .map(
      (o) =>
        `L.marker([${o.lat}, ${o.lng}]).addTo(map).bindPopup(${JSON.stringify(
          o.plaka,
        )});`,
    )
    .join("\n");
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map').setView([${center[0]}, ${center[1]}], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    ${markers}
  </script>
</body>
</html>
`;
};

export default function UlasimHizmetleriScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [hatlar, setHatlar] = useState<UlasimHatti[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const [kartTuruAcik, setKartTuruAcik] = useState(false);

  const [aramaMetni, setAramaMetni] = useState("");
  const [seciliHat, setSeciliHat] = useState<UlasimHatti | null>(null);

  const [canliOtobusler, setCanliOtobusler] = useState<CanliOtobus[]>([]);
  const [canliLoading, setCanliLoading] = useState(false);

  useEffect(() => {
    getUlasimHatlari()
      .then(setHatlar)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!seciliHat || !seciliHat.canli) return;

    let cancelled = false;

    function fetchCanli() {
      setCanliLoading(true);
      getCanliOtobusler(seciliHat!.id)
        .then((items) => {
          if (!cancelled) setCanliOtobusler(items);
        })
        .catch(() => {
          if (!cancelled) setCanliOtobusler([]);
        })
        .finally(() => {
          if (!cancelled) setCanliLoading(false);
        });
    }

    fetchCanli();
    const interval = setInterval(fetchCanli, CANLI_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [seciliHat]);

  const filtrelenmisHatlar = useMemo(() => {
    const sorgu = aramaMetni.trim().toLocaleLowerCase("tr");
    if (!sorgu) return hatlar;
    return hatlar.filter(
      (hat) =>
        hat.hatAdi.toLocaleLowerCase("tr").includes(sorgu) ||
        hat.guzergah.toLocaleLowerCase("tr").includes(sorgu),
    );
  }, [hatlar, aramaMetni]);

  function hatSec(hat: UlasimHatti) {
    setSeciliHat(hat);
    setCanliOtobusler([]);
  }

  function aramayaDon() {
    setSeciliHat(null);
    setCanliOtobusler([]);
  }

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
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => Linking.openURL(KART_BASIM_KONUM_URL)}
          accessibilityRole="button"
        >
          <Card style={styles.optionCard}>
            <View style={styles.iconCircle}>
              <MaterialIcons
                name="location-on"
                size={26}
                color={colors.onPrimary}
              />
            </View>
            <View style={styles.optionTextGroup}>
              <Text style={styles.optionTitle}>{t("ulasim_kartTitle")}</Text>
              <Text style={styles.optionSubtitle}>{KART_BASIM_ADRESI}</Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={colors.outline}
            />
          </Card>
        </Pressable>

        <SecondaryButton
          label={
            kartTuruAcik
              ? t("ulasim_kartTuruButtonHide")
              : t("ulasim_kartTuruButton")
          }
          onPress={() => setKartTuruAcik((acik) => !acik)}
        />

        {kartTuruAcik && (
          <View style={styles.kartTuruListesi}>
            {KART_TIPLERI.map((kart) => (
              <View key={kart.ad} style={styles.kartTuruItem}>
                <Image
                  source={{ uri: kart.url }}
                  style={styles.kartTuruGorsel}
                  resizeMode="contain"
                />
                <Text style={styles.kartTuruAd}>{kart.ad}</Text>
              </View>
            ))}
          </View>
        )}

        <SecondaryButton
          label={t("ulasim_bakiyeButton")}
          onPress={() =>
            Alert.alert(
              t("ulasim_bakiyeYakindaTitle"),
              t("ulasim_bakiyeYakindaMesaj"),
            )
          }
        />

        {!seciliHat ? (
          <View>
            <Text style={styles.aramaLabel}>{t("ulasim_aramaLabel")}</Text>
            <View style={styles.aramaKutusu}>
              <MaterialIcons name="search" size={20} color={colors.outline} />
              <TextInput
                style={styles.aramaInput}
                placeholder={t("ulasim_aramaPlaceholder")}
                placeholderTextColor={colors.outline}
                value={aramaMetni}
                onChangeText={setAramaMetni}
              />
            </View>

            <View style={styles.hatListesi}>
              {isLoading && (
                <ActivityIndicator color={colors.primaryContainer} />
              )}
              {!isLoading && error && (
                <Text style={styles.errorText}>{t("ulasim_error")}</Text>
              )}
              {!isLoading && !error && filtrelenmisHatlar.length === 0 && (
                <Text style={styles.errorText}>{t("ulasim_aramaEmpty")}</Text>
              )}
              {!isLoading &&
                !error &&
                filtrelenmisHatlar.map((hat) => (
                  <Pressable
                    key={hat.id}
                    onPress={() => hatSec(hat)}
                    accessibilityRole="button"
                  >
                    <Card style={styles.hatSatiri}>
                      <MaterialIcons
                        name="directions-bus"
                        size={20}
                        color={colors.primaryContainer}
                      />
                      <View style={styles.optionTextGroup}>
                        <Text style={styles.optionTitle}>
                          {hat.hatNumarasi
                            ? `${hat.hatNumarasi} · ${hat.hatAdi}`
                            : hat.hatAdi}
                        </Text>
                        <Text style={styles.optionSubtitle}>
                          {hat.guzergah}
                        </Text>
                      </View>
                    </Card>
                  </Pressable>
                ))}
            </View>
          </View>
        ) : (
          <View style={styles.detayContainer}>
            <Pressable
              onPress={aramayaDon}
              accessibilityRole="button"
              style={styles.geriDonButton}
            >
              <MaterialIcons
                name="arrow-back"
                size={18}
                color={colors.primaryContainer}
              />
              <Text style={styles.geriDonText}>{t("ulasim_geriDon")}</Text>
            </Pressable>

            <Card style={styles.detayKart}>
              <Text style={styles.optionTitle}>
                {seciliHat.hatNumarasi
                  ? `${seciliHat.hatNumarasi} · ${seciliHat.hatAdi}`
                  : seciliHat.hatAdi}
              </Text>
              <Text style={styles.optionSubtitle}>{seciliHat.guzergah}</Text>

              <View style={styles.detaySatir}>
                <Text style={styles.detayEtiket}>
                  {t("ulasim_fiyatTam")}
                </Text>
                <Text style={styles.detayDeger}>
                  {seciliHat.fiyatTam ?? "-"}
                </Text>
              </View>
              <View style={styles.detaySatir}>
                <Text style={styles.detayEtiket}>
                  {t("ulasim_fiyatIndirimli")}
                </Text>
                <Text style={styles.detayDeger}>
                  {seciliHat.fiyatIndirimli ?? "-"}
                </Text>
              </View>

              <Text style={styles.canliBaslik}>
                {t("ulasim_kalkisSaatleri")}
              </Text>
              {seciliHat.kalkisSaatleri.length === 0 ? (
                <Text style={styles.optionSubtitle}>
                  {t("ulasim_saatYok")}
                </Text>
              ) : (
                <>
                  <View style={styles.detaySatir}>
                    <Text style={styles.detayEtiket}>
                      {t("ulasim_gidisSaatleri")}
                    </Text>
                    <Text style={styles.detayDeger}>
                      {seciliHat.kalkisSaatleri
                        .filter((k) => k.yon === "gidis")
                        .map((k) => k.saat)
                        .sort()
                        .join(", ") || "-"}
                    </Text>
                  </View>
                  <View style={styles.detaySatir}>
                    <Text style={styles.detayEtiket}>
                      {t("ulasim_donusSaatleri")}
                    </Text>
                    <Text style={styles.detayDeger}>
                      {seciliHat.kalkisSaatleri
                        .filter((k) => k.yon === "donus")
                        .map((k) => k.saat)
                        .sort()
                        .join(", ") || "-"}
                    </Text>
                  </View>
                </>
              )}

              {seciliHat.canli && (
                <>
                  <Text style={styles.canliBaslik}>
                    {t("ulasim_canliKonumlar")}
                  </Text>
                  {canliLoading && canliOtobusler.length === 0 ? (
                    <ActivityIndicator color={colors.primaryContainer} />
                  ) : canliOtobusler.length === 0 ? (
                    <Text style={styles.optionSubtitle}>
                      {t("ulasim_canliBosluk")}
                    </Text>
                  ) : (
                    <View style={styles.mapCard}>
                      <WebView
                        source={{ html: buildOtobusMapHtml(canliOtobusler) }}
                        style={styles.webview}
                      />
                    </View>
                  )}
                </>
              )}
            </Card>
          </View>
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
    kartTuruListesi: {
      gap: spacing.stackGap,
    },
    kartTuruItem: {
      alignItems: "center",
      gap: spacing.stackGap / 2,
    },
    kartTuruGorsel: {
      width: "100%",
      height: 180,
      borderRadius: shape.roundedLg,
      backgroundColor: colors.surfaceContainerLowest,
    },
    kartTuruAd: {
      ...typography.labelLg,
      color: colors.onBackground,
      textAlign: "center",
    },
    aramaLabel: {
      ...typography.labelLg,
      color: colors.onBackground,
      marginBottom: spacing.stackGap / 2,
    },
    aramaKutusu: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: shape.rounded,
      paddingHorizontal: spacing.stackGap,
      minHeight: spacing.touchTargetMin,
    },
    aramaInput: {
      ...typography.bodyMd,
      color: colors.onBackground,
      flex: 1,
    },
    hatListesi: {
      gap: spacing.stackGap / 2,
      marginTop: spacing.stackGap / 2,
    },
    hatSatiri: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
      padding: spacing.stackGap,
    },
    detayContainer: {
      gap: spacing.stackGap,
    },
    geriDonButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
      alignSelf: "flex-start",
    },
    geriDonText: {
      ...typography.labelLg,
      color: colors.primaryContainer,
    },
    detayKart: {
      padding: spacing.stackGap,
      gap: spacing.stackGap / 2,
    },
    detaySatir: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: spacing.stackGap / 2,
    },
    detayEtiket: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    detayDeger: {
      ...typography.bodyMd,
      color: colors.onBackground,
    },
    canliBaslik: {
      ...typography.labelLg,
      color: colors.onBackground,
      marginTop: spacing.stackGap,
    },
    mapCard: {
      height: 220,
      borderRadius: shape.roundedLg,
      overflow: "hidden",
    },
    webview: {
      flex: 1,
      backgroundColor: "transparent",
    },
  });
