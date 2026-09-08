import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createBasvuru } from "../api/basvurular";
import { BasvuruTuru } from "../api/types";
import { Card, PrimaryButton } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { basvuruIdEkle } from "../storage/basvuruStorage";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

const MAX_BELGE_BOYUTU = 3 * 1024 * 1024;
const MAX_TOPLAM_BELGE_BOYUTU = 6 * 1024 * 1024;

type BelgeVeri = { base64: string; mimeType: string; ad: string };

export default function BasvuruFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { basvuruTuru } = route.params as { basvuruTuru: BasvuruTuru };
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [kimlikNo, setKimlikNo] = useState("");
  const [adSoyad, setAdSoyad] = useState("");
  const [dogumTarihi, setDogumTarihi] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [adres, setAdres] = useState("");
  const [ekBilgiDegerleri, setEkBilgiDegerleri] = useState<
    Record<string, string>
  >({});
  const [belgeler, setBelgeler] = useState<Record<string, BelgeVeri>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setEkBilgi(etiket: string, deger: string) {
    setEkBilgiDegerleri((prev) => ({ ...prev, [etiket]: deger }));
  }

  function belgeEkle(
    etiket: string,
    base64: string,
    mimeType: string,
    ad: string,
  ) {
    const boyutBayt = (base64.length * 3) / 4;
    if (boyutBayt > MAX_BELGE_BOYUTU) {
      Alert.alert(
        t("basvuruForm_errorTitle"),
        t("basvuruForm_dosyaBoyutuHata"),
      );
      return;
    }
    const mevcutToplamBayt = Object.entries(belgeler)
      .filter(([mevcutEtiket]) => mevcutEtiket !== etiket)
      .reduce((toplam, [, veri]) => toplam + (veri.base64.length * 3) / 4, 0);
    if (mevcutToplamBayt + boyutBayt > MAX_TOPLAM_BELGE_BOYUTU) {
      Alert.alert(
        t("basvuruForm_errorTitle"),
        t("basvuruForm_toplamBoyutHata"),
      );
      return;
    }
    setBelgeler((prev) => ({ ...prev, [etiket]: { base64, mimeType, ad } }));
  }

  function belgeKaldir(etiket: string) {
    setBelgeler((prev) => {
      const next = { ...prev };
      delete next[etiket];
      return next;
    });
  }

  async function pickFoto(etiket: string) {
    const openLibrary = async () => {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        base64: true,
        quality: 0.4,
      });
      if (picked.canceled) return;
      const asset = picked.assets[0];
      if (asset.base64) {
        belgeEkle(
          etiket,
          asset.base64,
          "image/jpeg",
          t("basvuruForm_fotografEklendi"),
        );
      }
    };

    const openCamera = async () => {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return;
      const picked = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        base64: true,
        quality: 0.4,
      });
      if (picked.canceled) return;
      const asset = picked.assets[0];
      if (asset.base64) {
        belgeEkle(
          etiket,
          asset.base64,
          "image/jpeg",
          t("basvuruForm_fotografEklendi"),
        );
      }
    };

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            t("common_cancel"),
            t("atikAi_takePhoto"),
            t("atikAi_pickFromGallery"),
          ],
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1) void openCamera();
          if (index === 2) void openLibrary();
        },
      );
      return;
    }

    Alert.alert(t("basvuruForm_belgeSecenekFoto"), undefined, [
      { text: t("atikAi_takePhoto"), onPress: () => void openCamera() },
      { text: t("atikAi_pickFromGallery"), onPress: () => void openLibrary() },
      { text: t("common_cancel"), style: "cancel" },
    ]);
  }

  async function pickPdf(etiket: string) {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const base64 = await new File(asset.uri).base64();
      belgeEkle(etiket, base64, asset.mimeType ?? "application/pdf", asset.name);
    } catch {
      Alert.alert(t("basvuruForm_errorTitle"), t("basvuruForm_pdfSecimHata"));
    }
  }

  function handleBelgeSec(etiket: string) {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            t("common_cancel"),
            t("basvuruForm_belgeSecenekFoto"),
            t("basvuruForm_belgeSecenekPdf"),
          ],
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1) void pickFoto(etiket);
          if (index === 2) void pickPdf(etiket);
        },
      );
      return;
    }

    Alert.alert(t("basvuruForm_belgeEkle"), undefined, [
      {
        text: t("basvuruForm_belgeSecenekFoto"),
        onPress: () => void pickFoto(etiket),
      },
      {
        text: t("basvuruForm_belgeSecenekPdf"),
        onPress: () => void pickPdf(etiket),
      },
      { text: t("common_cancel"), style: "cancel" },
    ]);
  }

  function eksikAlanlar(): string[] {
    const eksikler: string[] = [];
    if (!/^\d{11}$/.test(kimlikNo.trim())) {
      eksikler.push(t("basvuruForm_kimlikNoLabel"));
    }
    if (!adSoyad.trim()) eksikler.push(t("basvuruForm_adSoyadLabel"));
    if (!dogumTarihi) eksikler.push(t("basvuruForm_dogumTarihiLabel"));
    if (!adres.trim()) eksikler.push(t("basvuruForm_adresLabel"));
    basvuruTuru.ekBilgiAlanlari.forEach((alan) => {
      if (alan.zorunlu && !(ekBilgiDegerleri[alan.etiket] ?? "").trim()) {
        eksikler.push(alan.etiket);
      }
    });
    basvuruTuru.gerekliBelgeler.forEach((belge) => {
      if (belge.zorunlu && !belgeler[belge.etiket]) {
        eksikler.push(belge.etiket);
      }
    });
    return eksikler;
  }

  async function handleGonder() {
    const eksikler = eksikAlanlar();
    if (eksikler.length > 0) {
      Alert.alert(
        t("basvuruForm_validationTitle"),
        t("basvuruForm_validationMessage").replace(
          "{alanlar}",
          eksikler.join(", "),
        ),
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const basvuru = await createBasvuru({
        basvuruTuruId: basvuruTuru.id,
        kimlikNo: kimlikNo.trim(),
        adSoyad: adSoyad.trim(),
        dogumTarihi,
        adres: adres.trim(),
        ekBilgiler: basvuruTuru.ekBilgiAlanlari
          .map((alan) => ({
            etiket: alan.etiket,
            deger: (ekBilgiDegerleri[alan.etiket] ?? "").trim(),
          }))
          .filter((ek) => ek.deger.length > 0),
        belgeler: basvuruTuru.gerekliBelgeler
          .map((belge) => {
            const veri = belgeler[belge.etiket];
            return veri
              ? {
                  etiket: belge.etiket,
                  base64: veri.base64,
                  mimeType: veri.mimeType,
                }
              : null;
          })
          .filter(
            (
              belge,
            ): belge is { etiket: string; base64: string; mimeType: string } =>
              belge !== null,
          ),
      });
      await basvuruIdEkle(basvuru.id);
      Alert.alert(t("basvuruForm_successTitle"), t("basvuruForm_successMessage"));
      navigation.navigate("Basvurularim" as never);
    } catch (err) {
      const mesaj =
        err instanceof Error ? err.message : t("basvuruForm_errorMessage");
      Alert.alert(t("basvuruForm_errorTitle"), mesaj);
    } finally {
      setIsSubmitting(false);
    }
  }

  const secilenTarih = (() => {
    if (!dogumTarihi) return new Date();
    const [yil, ay, gun] = dogumTarihi.split("-").map(Number);
    return new Date(yil, ay - 1, gun);
  })();

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
          {basvuruTuru.baslik}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {basvuruTuru.aciklama ? (
          <Card style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>{basvuruTuru.aciklama}</Text>
          </Card>
        ) : null}

        <Card style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>{t("basvuruForm_kimlikNoLabel")} *</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={colors.outline}
              keyboardType="number-pad"
              maxLength={11}
              value={kimlikNo}
              onChangeText={setKimlikNo}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{t("basvuruForm_adSoyadLabel")} *</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={colors.outline}
              value={adSoyad}
              onChangeText={setAdSoyad}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>
              {t("basvuruForm_dogumTarihiLabel")} *
            </Text>
            <Pressable
              style={[styles.input, styles.dateInput]}
              onPress={() => setShowDatePicker(true)}
              accessibilityRole="button"
            >
              <Text style={dogumTarihi ? styles.dateText : styles.datePlaceholderText}>
                {dogumTarihi || t("basvuruForm_dogumTarihiSecPlaceholder")}
              </Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={secilenTarih}
                mode="date"
                maximumDate={new Date()}
                onValueChange={(_event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const yil = selectedDate.getFullYear();
                    const ay = String(selectedDate.getMonth() + 1).padStart(
                      2,
                      "0",
                    );
                    const gun = String(selectedDate.getDate()).padStart(
                      2,
                      "0",
                    );
                    setDogumTarihi(`${yil}-${ay}-${gun}`);
                  }
                }}
                onDismiss={() => setShowDatePicker(false)}
              />
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{t("basvuruForm_adresLabel")} *</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholderTextColor={colors.outline}
              value={adres}
              onChangeText={setAdres}
              multiline
            />
          </View>
        </Card>

        {basvuruTuru.ekBilgiAlanlari.length > 0 && (
          <Card style={styles.form}>
            <Text style={styles.sectionTitle}>
              {t("basvuruForm_ekBilgilerTitle")}
            </Text>
            {basvuruTuru.ekBilgiAlanlari.map((alan) => (
              <View key={alan.etiket} style={styles.field}>
                <Text style={styles.label}>
                  {alan.etiket}
                  {alan.zorunlu ? " *" : ""}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor={colors.outline}
                  value={ekBilgiDegerleri[alan.etiket] ?? ""}
                  onChangeText={(deger) => setEkBilgi(alan.etiket, deger)}
                />
              </View>
            ))}
          </Card>
        )}

        {basvuruTuru.gerekliBelgeler.length > 0 && (
          <Card style={styles.form}>
            <Text style={styles.sectionTitle}>
              {t("basvuruForm_belgelerTitle")}
            </Text>
            {basvuruTuru.gerekliBelgeler.map((belge) => {
              const veri = belgeler[belge.etiket];
              return (
                <View key={belge.etiket} style={styles.field}>
                  <Text style={styles.label}>
                    {belge.etiket}
                    {belge.zorunlu ? " *" : ""}
                  </Text>
                  {belge.aciklama ? (
                    <Text style={styles.hint}>{belge.aciklama}</Text>
                  ) : null}
                  {veri ? (
                    <View style={styles.belgeRow}>
                      <MaterialIcons
                        name="insert-drive-file"
                        size={20}
                        color={colors.secondary}
                      />
                      <Text style={styles.belgeAd} numberOfLines={1}>
                        {veri.ad}
                      </Text>
                      <Pressable
                        onPress={() => belgeKaldir(belge.etiket)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={t("basvuruForm_belgeKaldir")}
                      >
                        <MaterialIcons
                          name="close"
                          size={20}
                          color={colors.error}
                        />
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => handleBelgeSec(belge.etiket)}
                      accessibilityRole="button"
                      style={styles.belgeEkleButton}
                    >
                      <MaterialIcons
                        name="attach-file"
                        size={18}
                        color={colors.outline}
                      />
                      <Text style={styles.belgeEkleText}>
                        {t("basvuruForm_belgeEkle")}
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </Card>
        )}

        <PrimaryButton
          label={
            isSubmitting
              ? t("basvuruForm_submitting")
              : t("basvuruForm_submit")
          }
          onPress={handleGonder}
          disabled={isSubmitting}
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
    descriptionCard: {
      padding: spacing.stackGap,
      backgroundColor: colors.primaryContainer,
    },
    descriptionText: {
      ...typography.bodyMd,
      color: colors.onPrimary,
    },
    form: {
      padding: spacing.stackGap,
      gap: spacing.stackGap,
    },
    sectionTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    field: {
      gap: spacing.stackGap / 2,
    },
    label: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    hint: {
      ...typography.labelSm,
      color: colors.outline,
    },
    input: {
      ...typography.bodyLg,
      minHeight: spacing.touchTargetMin,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: shape.rounded,
      paddingHorizontal: spacing.stackGap,
      color: colors.onBackground,
    },
    multilineInput: {
      minHeight: 80,
      paddingTop: spacing.stackGap / 2,
      textAlignVertical: "top",
    },
    dateInput: {
      justifyContent: "center",
    },
    dateText: {
      ...typography.bodyLg,
      color: colors.onBackground,
    },
    datePlaceholderText: {
      ...typography.bodyLg,
      color: colors.outline,
    },
    belgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
      minHeight: spacing.touchTargetMin,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: shape.rounded,
      paddingHorizontal: spacing.stackGap,
    },
    belgeAd: {
      ...typography.bodyMd,
      color: colors.onBackground,
      flex: 1,
    },
    belgeEkleButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.stackGap / 2,
      minHeight: spacing.touchTargetMin,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.outlineVariant,
      borderRadius: shape.rounded,
    },
    belgeEkleText: {
      ...typography.labelSm,
      color: colors.outline,
    },
  });
