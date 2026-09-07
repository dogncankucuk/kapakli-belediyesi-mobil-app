import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
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

import { updateProfile } from "../api/auth";
import { resolveMediaUrl } from "../api/client";
import { Card } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { useAppShell } from "../navigation/AppShellContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

function maskTcKimlikNo(tcKimlikNo: string | null): string | null {
  if (!tcKimlikNo) return null;
  if (tcKimlikNo.length !== 11) return tcKimlikNo;
  return `${tcKimlikNo.slice(0, 3)}*****${tcKimlikNo.slice(8)}`;
}

export default function HesapBilgilerimScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAppShell();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [mahalle, setMahalle] = useState(user?.mahalle ?? "");
  const [adres, setAdres] = useState(user?.adres ?? "");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [mahalleModalVisible, setMahalleModalVisible] = useState(false);

  async function handleMahalleSecim(secilen: string) {
    setMahalleModalVisible(false);
    if (!user || secilen === (user.mahalle ?? "")) return;
    const oncekiMahalle = mahalle;
    setMahalle(secilen);
    try {
      const updatedUser = await updateProfile({ mahalle: secilen });
      updateUser(updatedUser);
    } catch (err) {
      const mesaj = err instanceof Error ? err.message : "Bir hata oluştu";
      Alert.alert("Hata", mesaj);
      setMahalle(oncekiMahalle);
    }
  }

  async function handleAdresBlur() {
    if (!user || adres === (user.adres ?? "")) return;
    try {
      const updatedUser = await updateProfile({ adres });
      updateUser(updatedUser);
    } catch (err) {
      const mesaj = err instanceof Error ? err.message : "Bir hata oluştu";
      Alert.alert("Hata", mesaj);
      setAdres(user.adres ?? "");
    }
  }

  async function handleFotografYukle(base64: string) {
    setIsUploadingPhoto(true);
    try {
      const updatedUser = await updateProfile({ profilFotografiBase64: base64 });
      updateUser(updatedUser);
    } catch (err) {
      const mesaj = err instanceof Error ? err.message : "Bir hata oluştu";
      Alert.alert("Hata", mesaj);
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
                {isUploadingPhoto ? "Yükleniyor..." : "Fotoğraf Değiştir"}
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
              <Text style={styles.label}>Mahalle</Text>
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
                    {mahalle || "Mahalle seçiniz"}
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
              <Text style={styles.label}>Adres</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={adres}
                onChangeText={setAdres}
                onBlur={handleAdresBlur}
                placeholder="Adres giriniz"
                placeholderTextColor={colors.outline}
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
          <Pressable style={styles.securityRow} accessibilityRole="button">
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
            <Text style={styles.modalTitle}>Mahalle Seçiniz</Text>
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
                  <Text style={styles.modalItemText}>{item} Mahallesi</Text>
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
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors) =>
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
  });
