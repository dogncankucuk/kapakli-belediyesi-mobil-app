import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createRequest } from "../api/requests";
import { TalepKategorisi } from "../api/types";
import {
  Card,
  CategoryIconCard,
  LocationPreviewCard,
  LocationValue,
  PrimaryButton,
  SecondaryButton,
  SeveritySlider,
  StatusStepper,
  StatusStep,
  StepProgressBar,
} from "../components";
import {
  buildTalepKategoriTanimlari,
  YOGUNLUK_GOSTEREN_KATEGORILER,
} from "../constants/talepKategorileri";
import {
  talepKategoriRenkleri,
  defaultCategoryAccent,
  Colors,
  shape,
  spacing,
  typography,
  useThemeColors,
} from "../theme";
import { useTranslation } from "../i18n/LocaleContext";
import { takipNumarasiEkle } from "../storage/talepStorage";

const MAX_LENGTH = 500;
const MAX_FOTO = 2;

type Photo = { uri: string; base64: string };

export default function YeniTalepOlusturScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const kategoriTanimlari = useMemo(() => buildTalepKategoriTanimlari(t), [t]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [kategori, setKategori] = useState<TalepKategorisi | null>(null);
  const [adSoyad, setAdSoyad] = useState("");
  const [telefon, setTelefon] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [location, setLocation] = useState<LocationValue>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [yogunluk, setYogunluk] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showYogunluk = kategori
    ? YOGUNLUK_GOSTEREN_KATEGORILER.includes(kategori)
    : false;

  const step2Gecerli =
    adSoyad.trim().length > 0 &&
    telefon.trim().length >= 10 &&
    aciklama.trim().length > 0;

  const secilenKategori = kategoriTanimlari.find((k) => k.value === kategori);

  const handleFotoEkle = async () => {
    if (photos.length >= MAX_FOTO) return;

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
        setPhotos((prev) => [
          ...prev,
          { uri: asset.uri, base64: asset.base64! },
        ]);
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
        setPhotos((prev) => [
          ...prev,
          { uri: asset.uri, base64: asset.base64! },
        ]);
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

    Alert.alert(t("yeniTalep_fotoVideo"), undefined, [
      { text: t("atikAi_takePhoto"), onPress: () => void openCamera() },
      { text: t("atikAi_pickFromGallery"), onPress: () => void openLibrary() },
      { text: t("common_cancel"), style: "cancel" },
    ]);
  };

  const handleFotoSil = (uri: string) => {
    setPhotos((prev) => prev.filter((p) => p.uri !== uri));
  };

  async function handleGonder() {
    if (!kategori) return;
    setIsSubmitting(true);
    try {
      const talep = await createRequest({
        kategori,
        aciklama: aciklama.trim(),
        adSoyad: adSoyad.trim(),
        telefon: telefon.trim(),
        lat: location?.lat,
        lng: location?.lng,
        fotograflar: photos.map((p) => p.base64),
        yogunluk: showYogunluk ? yogunluk : undefined,
      });
      await takipNumarasiEkle(talep.id);
      Alert.alert(t("yeniTalep_successTitle"), t("yeniTalep_successMessage"));
      navigation.navigate("Taleplerim" as never);
    } catch {
      Alert.alert(t("yeniTalep_errorTitle"), t("yeniTalep_errorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  }

  const statusSteps: StatusStep[] = [
    {
      key: "alindi",
      label: t("yeniTalep_surecAlindi"),
      description: t("yeniTalep_surecAlindiAlt"),
    },
    {
      key: "incelemede",
      label: t("yeniTalep_surecIncelemede"),
      description: t("yeniTalep_surecIncelemedeAlt"),
    },
    {
      key: "cozuldu",
      label: t("yeniTalep_surecCozuldu"),
      description: t("yeniTalep_surecCozulduAlt"),
    },
  ];

  const stepLabel =
    step === 1
      ? t("yeniTalep_stepKategori")
      : step === 2
        ? t("yeniTalep_stepDetay")
        : t("yeniTalep_stepOnizleme");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() =>
            step === 1 ? navigation.goBack() : setStep((s) => (s - 1) as 1 | 2)
          }
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("common_back")}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.onBackground}
          />
        </Pressable>
        <View style={styles.headerTextColumn}>
          <Text style={styles.headerTitle}>
            {step === 3 ? t("yeniTalep_onizleme") : t("yeniTalep_title")}
          </Text>
        </View>
      </View>

      <View style={styles.progressWrapper}>
        <StepProgressBar step={step} totalSteps={3} label={stepLabel} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <>
            <Text style={styles.stepTitle}>{t("yeniTalep_step1Title")}</Text>
            <Text style={styles.stepSubtitle}>
              {t("yeniTalep_step1Subtitle")}
            </Text>
            <View style={styles.kategoriGrid}>
              {kategoriTanimlari.map((tanim) => (
                <CategoryIconCard
                  key={tanim.value}
                  icon={tanim.icon}
                  label={tanim.label}
                  subtitle={tanim.subtitle}
                  accent={
                    talepKategoriRenkleri[tanim.value] ?? defaultCategoryAccent
                  }
                  selected={kategori === tanim.value}
                  onPress={() => setKategori(tanim.value)}
                />
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            {secilenKategori && (
              <View style={styles.kategoriBadge}>
                <MaterialIcons
                  name={secilenKategori.icon}
                  size={16}
                  color={colors.onPrimaryContainer}
                />
                <Text style={styles.kategoriBadgeText}>
                  {secilenKategori.label}
                </Text>
              </View>
            )}

            <LocationPreviewCard value={location} onChange={setLocation} />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                {t("yeniTalep_iletisimBilgileri")}
              </Text>
              <Card style={styles.contactCard}>
                <TextInput
                  style={styles.input}
                  placeholder={t("yeniTalep_adSoyadPlaceholder")}
                  placeholderTextColor={colors.outline}
                  value={adSoyad}
                  onChangeText={setAdSoyad}
                  accessibilityLabel={t("yeniTalep_adSoyadPlaceholder")}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t("yeniTalep_telefonPlaceholder")}
                  placeholderTextColor={colors.outline}
                  value={telefon}
                  onChangeText={setTelefon}
                  keyboardType="phone-pad"
                  accessibilityLabel={t("yeniTalep_telefonPlaceholder")}
                />
              </Card>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t("yeniTalep_aciklama")}</Text>
              <TextInput
                style={styles.textArea}
                placeholder={t("yeniTalep_detayPlaceholder")}
                placeholderTextColor={colors.outline}
                multiline
                maxLength={MAX_LENGTH}
                value={aciklama}
                onChangeText={setAciklama}
              />
              <Text style={styles.counter}>
                {aciklama.length} / {MAX_LENGTH}
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>
                  {t("yeniTalep_fotoVideo")}
                </Text>
                <Text style={styles.sectionHint}>
                  {t("yeniTalep_enFazlaFoto")}
                </Text>
              </View>
              <View style={styles.fotoRow}>
                {photos.map((photo) => (
                  <View key={photo.uri} style={styles.fotoThumbWrapper}>
                    <Image
                      source={{ uri: photo.uri }}
                      style={styles.fotoThumb}
                    />
                    <Pressable
                      onPress={() => handleFotoSil(photo.uri)}
                      hitSlop={8}
                      accessibilityRole="button"
                      style={styles.fotoRemove}
                    >
                      <MaterialIcons name="close" size={14} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
                {photos.length < MAX_FOTO && (
                  <Pressable
                    onPress={handleFotoEkle}
                    accessibilityRole="button"
                    style={styles.fotoAdd}
                  >
                    <MaterialIcons
                      name="add"
                      size={22}
                      color={colors.outline}
                    />
                    <Text style={styles.fotoAddLabel}>
                      {t("yeniTalep_ekle")}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            {showYogunluk && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  {t("yeniTalep_yogunluk")}
                </Text>
                <SeveritySlider
                  labels={[
                    t("yeniTalep_yogunlukHafif"),
                    t("yeniTalep_yogunlukOrta"),
                    t("yeniTalep_yogunlukYogun"),
                    t("yeniTalep_yogunlukSiddetli"),
                  ]}
                  value={yogunluk}
                  onChange={setYogunluk}
                />
              </View>
            )}

            <View style={styles.footerButtons}>
              <SecondaryButton
                label={t("yeniTalep_geri")}
                onPress={() => setStep(1)}
                style={styles.footerButtonHalf}
              />
              <PrimaryButton
                label={t("yeniTalep_devamEt")}
                onPress={() => setStep(3)}
                disabled={!step2Gecerli}
                style={styles.footerButtonHalf}
              />
            </View>
          </>
        )}

        {step === 3 && secilenKategori && (
          <>
            <Card style={styles.previewCard}>
              <View style={styles.kategoriBadge}>
                <MaterialIcons
                  name={secilenKategori.icon}
                  size={16}
                  color={colors.onPrimaryContainer}
                />
                <Text style={styles.kategoriBadgeText}>
                  {secilenKategori.label}
                </Text>
              </View>
              <Text style={styles.previewTitle} numberOfLines={2}>
                {aciklama.trim().slice(0, 60) || t("yeniTalep_aciklama")}
              </Text>

              <PreviewRow
                icon="location-on"
                label={t("yeniTalep_konum")}
                value={
                  location
                    ? `${location.lat.toFixed(4)}°N · ${location.lng.toFixed(4)}°E`
                    : t("yeniTalep_konumIzniYok")
                }
                colors={colors}
              />
              <PreviewRow
                icon="description"
                label={t("yeniTalep_aciklama")}
                value={aciklama.trim()}
                colors={colors}
              />
              {showYogunluk && (
                <PreviewRow
                  icon="water-drop"
                  label={t("yeniTalep_yogunluk")}
                  value={
                    [
                      t("yeniTalep_yogunlukHafif"),
                      t("yeniTalep_yogunlukOrta"),
                      t("yeniTalep_yogunlukYogun"),
                      t("yeniTalep_yogunlukSiddetli"),
                    ][yogunluk]
                  }
                  colors={colors}
                />
              )}
              {photos.length > 0 && (
                <PreviewRow
                  icon="photo-camera"
                  label={t("yeniTalep_eklenti")}
                  value={`${photos.length} ${t("yeniTalep_fotografSayisi")}`}
                  colors={colors}
                />
              )}
            </Card>

            <View style={styles.infoBanner}>
              <MaterialIcons name="shield" size={18} color={colors.secondary} />
              <Text style={styles.infoBannerText}>
                {t("yeniTalep_infoBandi")}
              </Text>
            </View>

            <Text style={styles.sectionLabel}>{t("yeniTalep_surec")}</Text>
            <StatusStepper steps={statusSteps} currentIndex={0} />

            <View style={styles.footerButtons}>
              <SecondaryButton
                label={t("yeniTalep_duzenle")}
                onPress={() => setStep(2)}
                style={styles.footerButtonHalf}
              />
              <PrimaryButton
                label={
                  isSubmitting
                    ? t("yeniTalep_submitting")
                    : t("yeniTalep_submit")
                }
                onPress={handleGonder}
                disabled={isSubmitting}
                style={styles.footerButtonHalf}
              />
            </View>
          </>
        )}
      </ScrollView>

      {step === 1 && (
        <View style={styles.stickyFooter}>
          <PrimaryButton
            label={t("yeniTalep_devamEt")}
            onPress={() => setStep(2)}
            disabled={!kategori}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function PreviewRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: ComponentIconName;
  label: string;
  value: string;
  colors: Colors;
}) {
  const styles = useMemo(() => createPreviewRowStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <MaterialIcons name={icon} size={16} color={colors.secondary} />
      </View>
      <View style={styles.textColumn}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

type ComponentIconName = keyof typeof MaterialIcons.glyphMap;

const createPreviewRowStyles = (colors: Colors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      gap: spacing.stackGap / 2,
      paddingVertical: spacing.stackGap / 2,
    },
    iconBox: {
      width: 28,
      height: 28,
      borderRadius: shape.rounded,
      backgroundColor: colors.secondaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    textColumn: {
      flex: 1,
    },
    label: {
      ...typography.labelSm,
      color: colors.outline,
    },
    value: {
      ...typography.bodyMd,
      color: colors.onBackground,
    },
  });

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
    },
    headerTextColumn: {
      flex: 1,
    },
    headerTitle: {
      ...typography.titleLg,
      color: colors.onBackground,
    },
    progressWrapper: {
      paddingHorizontal: spacing.containerMargin,
      paddingBottom: spacing.stackGap,
    },
    content: {
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
      paddingBottom: spacing.containerMargin * 2,
    },
    stepTitle: {
      ...typography.headlineMdMobile,
      color: colors.onBackground,
    },
    stepSubtitle: {
      ...typography.bodyMd,
      color: colors.outline,
      marginBottom: spacing.stackGap / 2,
    },
    kategoriGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.gridGutter,
    },
    kategoriBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 4,
      backgroundColor: colors.secondaryContainer,
      paddingHorizontal: spacing.stackGap,
      paddingVertical: 4,
      borderRadius: shape.roundedLg,
    },
    kategoriBadgeText: {
      ...typography.labelSm,
      color: colors.onPrimaryContainer,
    },
    section: {
      gap: spacing.stackGap / 2,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sectionLabel: {
      ...typography.labelSm,
      color: colors.outline,
    },
    sectionHint: {
      ...typography.labelSm,
      color: colors.outline,
    },
    contactCard: {
      padding: spacing.stackGap,
      gap: spacing.stackGap / 2,
    },
    input: {
      ...typography.bodyLg,
      color: colors.onBackground,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: shape.rounded,
      paddingHorizontal: spacing.stackGap,
      minHeight: spacing.touchTargetMin,
    },
    textArea: {
      ...typography.bodyMd,
      height: 100,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: shape.rounded,
      padding: spacing.stackGap,
      color: colors.onBackground,
      textAlignVertical: "top",
    },
    counter: {
      ...typography.labelSm,
      color: colors.outline,
      alignSelf: "flex-end",
    },
    fotoRow: {
      flexDirection: "row",
      gap: spacing.stackGap,
    },
    fotoThumbWrapper: {
      width: 84,
      height: 84,
    },
    fotoThumb: {
      width: 84,
      height: 84,
      borderRadius: shape.rounded,
    },
    fotoRemove: {
      position: "absolute",
      top: -6,
      right: -6,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.onBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    fotoAdd: {
      width: 84,
      height: 84,
      borderRadius: shape.rounded,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.outlineVariant,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    },
    fotoAddLabel: {
      ...typography.labelSm,
      color: colors.outline,
    },
    footerButtons: {
      flexDirection: "row",
      gap: spacing.stackGap,
      marginTop: spacing.stackGap,
    },
    footerButtonHalf: {
      flex: 1,
    },
    stickyFooter: {
      padding: spacing.containerMargin,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
      backgroundColor: colors.background,
    },
    previewCard: {
      padding: spacing.containerMargin,
      gap: spacing.stackGap / 2,
    },
    previewTitle: {
      ...typography.titleLg,
      color: colors.onBackground,
      marginTop: spacing.stackGap / 2,
    },
    infoBanner: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.stackGap / 2,
      backgroundColor: colors.secondaryContainer,
      padding: spacing.stackGap,
      borderRadius: shape.roundedLg,
    },
    infoBannerText: {
      ...typography.bodyMd,
      color: colors.onBackground,
      flex: 1,
    },
  });
