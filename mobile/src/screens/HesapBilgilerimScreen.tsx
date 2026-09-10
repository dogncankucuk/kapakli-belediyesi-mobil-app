import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Kapaklı Kaymakamlığı'nın resmi mahalle listesi (kapakli.gov.tr/mahalleler)
const KAPAKLI_MAHALLELERI = [
  "Atatürk",
  "Bahçelievler",
  "Cumhuriyet",
  "İnönü",
  "İsmetpaşa",
  "Bahçeağıl",
  "Karlı",
  "Pınarca",
  "Uzunhacı",
  "Yanıkağıl",
  "Fatih",
  "Karaağaç",
  "Kazımkarabekir",
  "Mimar Sinan",
  "Adnan Menderes",
  "Mevlana",
  "Ömer Halisdemir",
  "Vatan",
  "Yıldızkent",
  "Yunus Emre",
  "19 Mayıs",
];

import { changePassword, updateProfile } from "../api/auth";
import { resolveMediaUrl } from "../api/client";
import { Card, PrimaryButton } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { useAppShell } from "../navigation/AppShellContext";
import { Colors, shape, spacing, Typography, useThemeColors, useTypography } from "../theme";

function maskTcKimlikNo(tcKimlikNo: string | null): string | null {
  if (!tcKimlikNo) return null;
  if (tcKimlikNo.length !== 11) return tcKimlikNo;
  return `${tcKimlikNo.slice(0, 3)}*****${tcKimlikNo.slice(8)}`;
}

// Backend'deki sifre regex'iyle (register.dto.ts) ayni karakter setlerini
// kullanan, kullanici yazarken anlik kural kontrolu icin ayrik fonksiyonlar
// (GirisEkraniScreen.tsx'teki sifreKurallari ile ayni mantik, bu ekrana ozel
// kullanildigi icin yerel olarak tekrar tanimlandi).
const sifreKurallari = [
  {
    etiketKey: "sifreKurali_minKarakter" as const,
    kontrolEt: (sifre: string) => sifre.length >= 8,
  },
  {
    etiketKey: "sifreKurali_buyukHarf" as const,
    kontrolEt: (sifre: string) => /[A-ZÇĞİÖŞÜ]/.test(sifre),
  },
  {
    etiketKey: "sifreKurali_kucukHarf" as const,
    kontrolEt: (sifre: string) => /[a-zçğıöşü]/.test(sifre),
  },
  {
    etiketKey: "sifreKurali_rakam" as const,
    kontrolEt: (sifre: string) => /\d/.test(sifre),
  },
  {
    etiketKey: "sifreKurali_noktalama" as const,
    kontrolEt: (sifre: string) => /[^\wçğıöşüÇĞİÖŞÜ\s]/.test(sifre),
  },
];

export default function HesapBilgilerimScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAppShell();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  const [mahalle, setMahalle] = useState(user?.mahalle ?? "");
  const [adres, setAdres] = useState(user?.adres ?? "");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [mahalleModalVisible, setMahalleModalVisible] = useState(false);

  const [changePasswordModalVisible, setChangePasswordModalVisible] =
    useState(false);
  const [mevcutSifre, setMevcutSifre] = useState("");
  const [yeniSifre, setYeniSifre] = useState("");
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState("");
  const [changePasswordError, setChangePasswordError] = useState<
    string | null
  >(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const yeniSifreGecerli = sifreKurallari.every((kural) =>
    kural.kontrolEt(yeniSifre),
  );
  const yeniSifreTekrarHatali =
    yeniSifreTekrar.length > 0 && yeniSifreTekrar !== yeniSifre;
  const changePasswordDisabled =
    !mevcutSifre ||
    !yeniSifreGecerli ||
    yeniSifreTekrar !== yeniSifre ||
    isChangingPassword;

  function openChangePasswordModal() {
    setMevcutSifre("");
    setYeniSifre("");
    setYeniSifreTekrar("");
    setChangePasswordError(null);
    setChangePasswordModalVisible(true);
  }

  function closeChangePasswordModal() {
    setChangePasswordModalVisible(false);
  }

  // Backend'in bilinen iki hata mesajını dile göre çevirir - dil ne olursa
  // olsun kullanıcı Türkçe sunucu metni görmesin diye. Tanınmayan bir mesaj
  // gelirse (örn. zayıf şifre - mobil zaten göndermeden engelliyor) ham
  // metin gösterilir, sessizce yutulmaz.
  function changePasswordHataMesaji(ham: string): string {
    if (ham === "Mevcut şifreniz hatalı") {
      return t("hesapBilgilerim_currentPasswordWrong");
    }
    if (ham === "Google hesabınız için şifre değiştirilemez") {
      return t("hesapBilgilerim_googleAccountNoPassword");
    }
    return ham;
  }

  async function handleChangePasswordSubmit() {
    setChangePasswordError(null);
    setIsChangingPassword(true);
    try {
      await changePassword(mevcutSifre, yeniSifre);
      setChangePasswordModalVisible(false);
      setMevcutSifre("");
      setYeniSifre("");
      setYeniSifreTekrar("");
      Alert.alert(
        t("hesapBilgilerim_changePasswordSuccessTitle"),
        t("hesapBilgilerim_changePasswordSuccessBody"),
      );
    } catch (err) {
      setChangePasswordError(
        err instanceof Error
          ? changePasswordHataMesaji(err.message)
          : t("common_error"),
      );
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleMahalleSecim(secilen: string) {
    setMahalleModalVisible(false);
    if (!user || secilen === (user.mahalle ?? "")) return;
    const oncekiMahalle = mahalle;
    setMahalle(secilen);
    try {
      const updatedUser = await updateProfile({ mahalle: secilen });
      updateUser(updatedUser);
    } catch (err) {
      const mesaj = err instanceof Error ? err.message : t("common_error");
      Alert.alert(t("common_errorTitle"), mesaj);
      setMahalle(oncekiMahalle);
    }
  }

  // Stale-closure'dan kacinmak icin "sunucuda bilinen son deger" ve "en son
  // yazilan deger" birer ref'te tutuluyor - unmount/debounce gibi gecikmeli
  // callback'ler her zaman GUNCEL degerleri okusun diye (React state/context
  // closure'lari degil).
  const adresRef = useRef(adres);
  const sonKaydedilenAdresRef = useRef(user?.adres ?? "");
  const adresDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    adresRef.current = adres;
  }, [adres]);

  useEffect(() => {
    sonKaydedilenAdresRef.current = user?.adres ?? "";
  }, [user?.adres]);

  async function saveAdres(deger: string) {
    if (deger === sonKaydedilenAdresRef.current) return;
    const oncekiDeger = sonKaydedilenAdresRef.current;
    sonKaydedilenAdresRef.current = deger;
    try {
      const updatedUser = await updateProfile({ adres: deger });
      updateUser(updatedUser);
    } catch (err) {
      sonKaydedilenAdresRef.current = oncekiDeger;
      const mesaj = err instanceof Error ? err.message : t("common_error");
      Alert.alert(t("common_errorTitle"), mesaj);
      setAdres(oncekiDeger);
    }
  }

  // onBlur Android'de donanim geri tusu gibi bazi odak-kaybi senaryolarinda
  // guvenilir sekilde tetiklenmiyor - yazma durduktan kisa sure sonra
  // otomatik kaydeden bir debounce ile yedekleniyor.
  useEffect(() => {
    const zamanlayici = setTimeout(() => {
      void saveAdres(adres);
    }, 800);
    adresDebounceRef.current = zamanlayici;
    return () => clearTimeout(zamanlayici);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adres]);

  useEffect(() => {
    return () => {
      // Ekran kapanirken bekleyen bir degisiklik varsa son kez kaydetmeyi dene.
      if (adresRef.current !== sonKaydedilenAdresRef.current) {
        sonKaydedilenAdresRef.current = adresRef.current;
        void updateProfile({ adres: adresRef.current }).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAdresBlur() {
    if (adresDebounceRef.current) clearTimeout(adresDebounceRef.current);
    void saveAdres(adres);
  }

  async function handleFotografYukle(base64: string) {
    setIsUploadingPhoto(true);
    try {
      const updatedUser = await updateProfile({ profilFotografiBase64: base64 });
      updateUser(updatedUser);
    } catch (err) {
      const mesaj = err instanceof Error ? err.message : t("common_error");
      Alert.alert(t("common_errorTitle"), mesaj);
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  function handleFotografSec() {
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
      if (asset.base64) await handleFotografYukle(asset.base64);
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
      if (asset.base64) await handleFotografYukle(asset.base64);
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

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
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
          <Text style={styles.headerTitle}>{t("hesapBilgilerim_title")}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {t("hesapBilgilerim_loginRequired")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
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
        <Text style={styles.headerTitle}>{t("hesapBilgilerim_title")}</Text>
        <MaterialIcons name="search" size={22} color={colors.onBackground} />
      </View>

      <View style={styles.content}>
        <View style={styles.identity}>
          <View style={styles.avatarColumn}>
            <Pressable
              onPress={handleFotografSec}
              disabled={isUploadingPhoto}
              accessibilityRole="button"
              style={styles.avatar}
            >
              {user.profilFotografiUrl ? (
                <Image
                  source={{ uri: resolveMediaUrl(user.profilFotografiUrl) }}
                  style={styles.avatarImage}
                />
              ) : (
                <MaterialIcons
                  name="person"
                  size={28}
                  color={colors.onPrimary}
                />
              )}
            </Pressable>
            <Pressable
              onPress={handleFotografSec}
              disabled={isUploadingPhoto}
              accessibilityRole="button"
            >
              <Text style={styles.changePhotoText}>
                {isUploadingPhoto
                  ? t("common_loading")
                  : t("hesapBilgilerim_changePhoto")}
              </Text>
            </Pressable>
          </View>
          <View>
            <Text style={styles.name}>
              {user.ad} {user.soyad}
            </Text>
            <Text style={styles.subtitle}>
              {maskTcKimlikNo(user.tcKimlikNo)
                ? `${t("hesapBilgilerim_tcNo")} ${maskTcKimlikNo(user.tcKimlikNo)}`
                : (user.eposta ?? "")}
            </Text>
          </View>
        </View>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="badge" size={18} color={colors.secondary} />
            <Text style={styles.cardTitle}>
              {t("hesapBilgilerim_personalInfo")}
            </Text>
          </View>
          <View style={styles.fieldRow}>
            <View style={styles.field}>
              <Text style={styles.label}>{t("hesapBilgilerim_ad")}</Text>
              <TextInput
                style={styles.input}
                value={user.ad}
                editable={false}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t("hesapBilgilerim_soyad")}</Text>
              <TextInput
                style={styles.input}
                value={user.soyad}
                editable={false}
              />
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="call" size={18} color={colors.secondary} />
            <Text style={styles.cardTitle}>
              {t("hesapBilgilerim_contactInfo")}
            </Text>
          </View>
          <View style={styles.fieldRow}>
            <View style={styles.field}>
              <Text style={styles.label}>{t("hesapBilgilerim_telefon")}</Text>
              <TextInput
                style={styles.input}
                value={user.telefon ?? "-"}
                editable={false}
              />
            </View>
          </View>
          <View style={styles.fieldRow}>
            <View style={styles.field}>
              <Text style={styles.label}>{t("hesapBilgilerim_mahalle")}</Text>
              <Pressable
                onPress={() => setMahalleModalVisible(true)}
                accessibilityRole="button"
              >
                <View style={[styles.input, styles.selectInput]}>
                  <Text
                    style={
                      mahalle ? styles.selectValue : styles.selectPlaceholder
                    }
                  >
                    {mahalle || t("hesapBilgilerim_mahalleSeciniz")}
                  </Text>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={20}
                    color={colors.outline}
                  />
                </View>
              </Pressable>
            </View>
          </View>
          <View style={styles.fieldRow}>
            <View style={styles.field}>
              <Text style={styles.label}>{t("hesapBilgilerim_adres")}</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={adres}
                onChangeText={setAdres}
                onBlur={handleAdresBlur}
                placeholder={t("hesapBilgilerim_adresPlaceholder")}
                placeholderTextColor={colors.outline}
                maxLength={500}
                multiline
              />
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="lock" size={18} color={colors.secondary} />
            <Text style={styles.cardTitle}>
              {t("hesapBilgilerim_security")}
            </Text>
          </View>
          <Pressable
            style={styles.securityRow}
            onPress={openChangePasswordModal}
            accessibilityRole="button"
          >
            <MaterialIcons
              name="vpn-key"
              size={18}
              color={colors.onBackground}
            />
            <Text style={styles.securityLabel}>
              {t("hesapBilgilerim_changePassword")}
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={18}
              color={colors.outline}
            />
          </Pressable>
        </Card>
      </View>

      <Modal
        visible={mahalleModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setMahalleModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMahalleModalVisible(false)}
        >
          <Pressable style={styles.modalSheet} onPress={() => undefined}>
            <Text style={styles.modalTitle}>
              {t("hesapBilgilerim_mahalleModalTitle")}
            </Text>
            <FlatList
              data={KAPAKLI_MAHALLELERI}
              keyExtractor={(item) => item}
              style={styles.modalList}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalItem}
                  onPress={() => void handleMahalleSecim(item)}
                  accessibilityRole="button"
                >
                  <Text style={styles.modalItemText}>
                    {item} {t("hesapBilgilerim_mahalleSuffix")}
                  </Text>
                  {item === mahalle && (
                    <MaterialIcons
                      name="check"
                      size={18}
                      color={colors.secondary}
                    />
                  )}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={changePasswordModalVisible}
        animationType="slide"
        onRequestClose={closeChangePasswordModal}
      >
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <Pressable
              onPress={closeChangePasswordModal}
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
            <Text style={styles.headerTitle}>
              {t("hesapBilgilerim_changePassword")}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.content}>
            <Card style={styles.card}>
              <View style={styles.field}>
                <Text style={styles.label}>
                  {t("hesapBilgilerim_currentPasswordLabel")}
                </Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={mevcutSifre}
                  onChangeText={setMevcutSifre}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  {t("hesapBilgilerim_newPasswordLabel")}
                </Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={yeniSifre}
                  onChangeText={setYeniSifre}
                />
                <View style={styles.sifreKuralListesi}>
                  {sifreKurallari.map((kural) => {
                    const gecti = kural.kontrolEt(yeniSifre);
                    return (
                      <View key={kural.etiketKey} style={styles.sifreKuralRow}>
                        <MaterialIcons
                          name={gecti ? "check-circle" : "cancel"}
                          size={16}
                          color={gecti ? colors.success : colors.outline}
                        />
                        <Text style={styles.sifreKuralText}>
                          {t(kural.etiketKey)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  {t("hesapBilgilerim_newPasswordAgainLabel")}
                </Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={yeniSifreTekrar}
                  onChangeText={setYeniSifreTekrar}
                />
                {yeniSifreTekrarHatali && (
                  <Text style={styles.fieldHata}>
                    {t("hesapBilgilerim_passwordMismatch")}
                  </Text>
                )}
              </View>

              {changePasswordError && (
                <Text style={styles.errorText}>{changePasswordError}</Text>
              )}

              <PrimaryButton
                label={t("hesapBilgilerim_changePasswordSubmit")}
                onPress={() => void handleChangePasswordSubmit()}
                disabled={changePasswordDisabled}
              />
            </Card>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors, typography: Typography) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.containerMargin,
    },
    emptyText: {
      ...typography.bodyLg,
      color: colors.outline,
      textAlign: "center",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.containerMargin,
      paddingVertical: spacing.stackGap,
    },
    headerTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.containerMargin,
      paddingBottom: spacing.stackGap,
      gap: spacing.stackGap,
    },
    identity: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
    },
    avatarColumn: {
      alignItems: "center",
      gap: 4,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    avatarImage: {
      width: 56,
      height: 56,
    },
    changePhotoText: {
      ...typography.labelSm,
      color: colors.secondary,
    },
    name: {
      ...typography.titleMd,
      color: colors.onBackground,
    },
    subtitle: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    card: {
      padding: spacing.stackGap,
      gap: spacing.stackGap / 2,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
    },
    cardTitle: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    fieldRow: {
      flexDirection: "row",
      gap: spacing.stackGap / 2,
    },
    field: {
      flex: 1,
      gap: 4,
    },
    label: {
      ...typography.labelSm,
      color: colors.outline,
    },
    input: {
      ...typography.bodyMd,
      minHeight: spacing.touchTargetMin - 8,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: shape.rounded,
      paddingHorizontal: spacing.stackGap / 2,
      color: colors.onBackground,
      backgroundColor: colors.background,
    },
    multilineInput: {
      minHeight: 64,
      paddingTop: spacing.stackGap / 2,
      textAlignVertical: "top",
    },
    selectInput: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    selectValue: {
      ...typography.bodyMd,
      color: colors.onBackground,
    },
    selectPlaceholder: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    modalSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: shape.roundedLg,
      borderTopRightRadius: shape.roundedLg,
      maxHeight: "70%",
      paddingTop: spacing.stackGap,
      paddingHorizontal: spacing.containerMargin,
      paddingBottom: spacing.stackGap * 2,
    },
    modalTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
      marginBottom: spacing.stackGap / 2,
    },
    modalList: {
      flexGrow: 0,
    },
    modalItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.stackGap / 2,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    modalItemText: {
      ...typography.bodyMd,
      color: colors.onBackground,
    },
    securityRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
      minHeight: spacing.touchTargetMin - 8,
    },
    securityLabel: {
      ...typography.bodyMd,
      color: colors.onBackground,
      flex: 1,
    },
    sifreKuralListesi: {
      gap: spacing.stackGap / 4,
    },
    sifreKuralRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
    },
    sifreKuralText: {
      ...typography.labelSm,
      color: colors.outline,
    },
    fieldHata: {
      ...typography.labelSm,
      color: colors.error,
    },
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
    },
  });
