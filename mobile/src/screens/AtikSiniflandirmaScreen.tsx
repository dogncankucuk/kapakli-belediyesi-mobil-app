import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAtikNoktalari } from "../api/atikNoktalari";
import { classifyAtik } from "../api/atikSiniflandirma";
import {
  AtikKategori,
  AtikNoktasi,
  AtikSiniflandirmaSonucu,
} from "../api/types";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

const EARTH_RADIUS_KM = 6371;

function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearest(
  noktalar: AtikNoktasi[],
  tur: string,
  lat: number,
  lng: number,
) {
  const adaylar = noktalar.filter((nokta) => nokta.tur === tur);
  if (adaylar.length === 0) return null;

  return adaylar.reduce<{ nokta: AtikNoktasi; mesafe: number } | null>(
    (nearest, nokta) => {
      const mesafe = haversineDistanceKm(lat, lng, nokta.lat, nokta.lng);
      if (!nearest || mesafe < nearest.mesafe) {
        return { nokta, mesafe };
      }
      return nearest;
    },
    null,
  );
}

const KATEGORI_RENK: Record<AtikKategori, string> = {
  Plastik: "#1E88E5",
  Kağıt: "#F9A825",
  Cam: "#00897B",
  Belirsiz: "#78909C",
};

const KATEGORI_IKON: Record<AtikKategori, keyof typeof MaterialIcons.glyphMap> =
  {
    Plastik: "local-drink",
    Kağıt: "description",
    Cam: "wine-bar",
    Belirsiz: "help-outline",
  };

// Türkiye'deki standart geri dönüşüm kutu renkleri - kategoriye göre
// hangi kutuya atılacağını gösteren aksiyon adımları için.
const KUTU_ADI: Record<AtikKategori, string | null> = {
  Plastik: "Sarı Kutu",
  Kağıt: "Mavi Kutu",
  Cam: "Yeşil Kutu",
  Belirsiz: null,
};

type AksiyonAdimi = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
};

const KATEGORI_AKSIYONLARI: Record<AtikKategori, AksiyonAdimi[]> = {
  Plastik: [
    { icon: "water-drop", label: "Yıka" },
    { icon: "compress", label: "Ez" },
    { icon: "tag", label: "Kapağı Ayır" },
  ],
  Kağıt: [
    { icon: "water-drop", label: "Kuru Tut" },
    { icon: "compress", label: "Düzleştir" },
  ],
  Cam: [
    { icon: "water-drop", label: "Yıka" },
    { icon: "warning-amber", label: "Kırma" },
  ],
  Belirsiz: [],
};

type Screen = "idle" | "loading" | "result" | "error";

export default function AtikSiniflandirmaScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [screen, setScreen] = useState<Screen>("idle");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<AtikSiniflandirmaSonucu | null>(null);
  const [locating, setLocating] = useState(false);

  const runClassification = async (base64: string, uri: string) => {
    setPhotoUri(uri);
    setScreen("loading");
    try {
      const sonuc = await classifyAtik(base64);
      setResult(sonuc);
      setScreen("result");
    } catch {
      setScreen("error");
    }
  };

  const handleCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("atikAi_permissionTitle"), t("atikAi_permissionMessage"));
      return;
    }
    const picked = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.5,
    });
    if (picked.canceled) return;
    const asset = picked.assets[0];
    if (asset.base64) {
      void runClassification(asset.base64, asset.uri);
    }
  };

  const handleGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("atikAi_permissionTitle"), t("atikAi_permissionMessage"));
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.5,
    });
    if (picked.canceled) return;
    const asset = picked.assets[0];
    if (asset.base64) {
      void runClassification(asset.base64, asset.uri);
    }
  };

  const reset = () => {
    setScreen("idle");
    setPhotoUri(null);
    setResult(null);
  };

  const handleShowNearest = async () => {
    if (!result?.ilgiliAtikTuru || locating) return;
    const ilgiliAtikTuru = result.ilgiliAtikTuru;

    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          t("atikAi_permissionTitle"),
          t("atikAi_locationPermissionMessage"),
        );
        return;
      }

      const [position, noktalar] = await Promise.all([
        Location.getCurrentPositionAsync({}),
        getAtikNoktalari(),
      ]);

      const nearest = findNearest(
        noktalar,
        ilgiliAtikTuru,
        position.coords.latitude,
        position.coords.longitude,
      );

      if (!nearest) {
        Alert.alert(t("atikAi_title"), t("atikAi_noNearbyPoint"));
        return;
      }

      navigation.navigate("Map", {
        initialTab: "atikNoktalari",
        focusId: `atik-${nearest.nokta.id}`,
      } as never);
    } catch {
      Alert.alert(t("atikAi_title"), t("atikAi_locationError"));
    } finally {
      setLocating(false);
    }
  };

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
        <Text style={styles.headerTitle}>{t("atikAi_title")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {screen === "idle" ? (
          <>
            <View style={styles.placeholder}>
              <MaterialIcons
                name="photo-camera"
                size={48}
                color={colors.outline}
              />
            </View>
            <Text style={styles.instructions}>{t("atikAi_instructions")}</Text>
            <Pressable
              onPress={handleCamera}
              accessibilityRole="button"
              style={styles.primaryButton}
            >
              <MaterialIcons
                name="photo-camera"
                size={20}
                color={colors.onPrimary}
              />
              <Text style={styles.primaryButtonText}>
                {t("atikAi_takePhoto")}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleGallery}
              accessibilityRole="button"
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>
                {t("atikAi_pickFromGallery")}
              </Text>
            </Pressable>
          </>
        ) : null}

        {screen === "loading" && photoUri ? (
          <>
            <Image source={{ uri: photoUri }} style={styles.photo} />
            <ActivityIndicator
              color={colors.primaryContainer}
              style={styles.loading}
            />
            <Text style={styles.instructions}>{t("atikAi_analyzing")}</Text>
          </>
        ) : null}

        {screen === "result" && photoUri && result ? (
          <>
            <Image source={{ uri: photoUri }} style={styles.photo} />
            <Card style={styles.resultCard}>
              <View style={styles.resultBadgeRow}>
                <MaterialIcons name="check-circle" size={16} color="#2E7D32" />
                <Text style={styles.resultBadgeText}>
                  {t("atikAi_confidence").toUpperCase()}:{" "}
                  {result.guven.toUpperCase()}
                </Text>
              </View>
              <View style={styles.resultHeader}>
                <View
                  style={[
                    styles.resultIcon,
                    { backgroundColor: KATEGORI_RENK[result.kategori] },
                  ]}
                >
                  <MaterialIcons
                    name={KATEGORI_IKON[result.kategori]}
                    size={24}
                    color={colors.onPrimary}
                  />
                </View>
                <View style={styles.resultHeaderText}>
                  <Text style={styles.resultKategori}>{result.kategori}</Text>
                </View>
              </View>
              <Text style={styles.resultAciklama}>{result.aciklama}</Text>

              {KATEGORI_AKSIYONLARI[result.kategori].length > 0 && (
                <View style={styles.aksiyonRow}>
                  {KATEGORI_AKSIYONLARI[result.kategori].map((adim) => (
                    <View key={adim.label} style={styles.aksiyonItem}>
                      <View style={styles.aksiyonIconBox}>
                        <MaterialIcons
                          name={adim.icon}
                          size={20}
                          color={colors.secondary}
                        />
                      </View>
                      <Text style={styles.aksiyonLabel} numberOfLines={1}>
                        {adim.label}
                      </Text>
                    </View>
                  ))}
                  {KUTU_ADI[result.kategori] && (
                    <View style={styles.aksiyonItem}>
                      <View
                        style={[
                          styles.aksiyonIconBox,
                          { backgroundColor: KATEGORI_RENK[result.kategori] },
                        ]}
                      >
                        <MaterialIcons
                          name="delete-outline"
                          size={20}
                          color={colors.onPrimary}
                        />
                      </View>
                      <Text style={styles.aksiyonLabel} numberOfLines={1}>
                        {KUTU_ADI[result.kategori]}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </Card>

            {result.ilgiliAtikTuru ? (
              <Pressable
                onPress={handleShowNearest}
                disabled={locating}
                accessibilityRole="button"
                style={[
                  styles.primaryButton,
                  locating && styles.buttonDisabled,
                ]}
              >
                {locating ? (
                  <ActivityIndicator size="small" color={colors.onPrimary} />
                ) : (
                  <MaterialIcons
                    name="near-me"
                    size={20}
                    color={colors.onPrimary}
                  />
                )}
                <Text style={styles.primaryButtonText}>
                  {locating ? t("atikAi_locating") : t("atikAi_showNearest")}
                </Text>
              </Pressable>
            ) : null}

            {result.ilgiliAtikTuru ? (
              <Pressable
                onPress={() =>
                  navigation.navigate("AtikNoktalari", {
                    initialFilter: result.ilgiliAtikTuru,
                  } as never)
                }
                accessibilityRole="button"
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>
                  {t("atikAi_showPoints")}
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={reset}
              accessibilityRole="button"
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>
                {t("atikAi_tryAgain")}
              </Text>
            </Pressable>
          </>
        ) : null}

        {screen === "error" ? (
          <>
            <MaterialIcons
              name="error-outline"
              size={48}
              color={colors.error}
            />
            <Text style={styles.errorText}>{t("atikAi_error")}</Text>
            <Pressable
              onPress={reset}
              accessibilityRole="button"
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                {t("atikAi_tryAgain")}
              </Text>
            </Pressable>
          </>
        ) : null}
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
      alignItems: "stretch",
    },
    placeholder: {
      height: 220,
      borderRadius: shape.roundedLg,
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
    },
    photo: {
      height: 260,
      borderRadius: shape.roundedLg,
      backgroundColor: colors.outlineVariant,
    },
    instructions: {
      ...typography.bodyMd,
      color: colors.outline,
      textAlign: "center",
    },
    loading: {
      marginTop: spacing.stackGap,
    },
    primaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.stackGap / 2,
      minHeight: spacing.touchTargetMin,
      borderRadius: shape.rounded,
      backgroundColor: colors.primaryContainer,
    },
    primaryButtonText: {
      ...typography.labelLg,
      color: colors.onPrimary,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    secondaryButton: {
      minHeight: spacing.touchTargetMin,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: shape.rounded,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    secondaryButtonText: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    resultCard: {
      padding: spacing.stackGap,
      gap: spacing.stackGap,
    },
    resultBadgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    resultBadgeText: {
      ...typography.labelSm,
      color: "#2E7D32",
      letterSpacing: 0.3,
    },
    aksiyonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    aksiyonItem: {
      alignItems: "center",
      gap: 4,
      flex: 1,
    },
    aksiyonIconBox: {
      width: 40,
      height: 40,
      borderRadius: shape.rounded,
      backgroundColor: colors.secondaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    aksiyonLabel: {
      ...typography.labelSm,
      color: colors.onBackground,
      textAlign: "center",
    },
    resultHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
    },
    resultIcon: {
      width: 44,
      height: 44,
      borderRadius: shape.rounded,
      alignItems: "center",
      justifyContent: "center",
    },
    resultHeaderText: {
      flex: 1,
      gap: 2,
    },
    resultKategori: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    resultGuven: {
      ...typography.labelSm,
      color: colors.outline,
    },
    resultAciklama: {
      ...typography.bodyMd,
      color: colors.onBackground,
    },
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
      textAlign: "center",
    },
  });
