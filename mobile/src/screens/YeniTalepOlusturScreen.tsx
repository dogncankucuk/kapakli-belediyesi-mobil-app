import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createRequest } from "../api/requests";
import { TalepKategorisi } from "../api/types";
import { Card, PrimaryButton, SegmentedControl } from "../components";
import { talepKategorileri } from "../constants/talepKategorileri";
import { takipNumarasiEkle } from "../storage/talepStorage";
import { colors, shape, spacing, typography } from "../theme";

const MAX_LENGTH = 500;

const ekDosyaSecenekleri = [
  { id: "belge", icon: "description" as const, label: "Belge Ekle" },
  { id: "fotograf", icon: "photo-camera" as const, label: "Fotoğraf Ekle" },
  { id: "video", icon: "videocam" as const, label: "Video Ekle" },
];

export default function YeniTalepOlusturScreen() {
  const navigation = useNavigation();
  const [kategori, setKategori] = useState<TalepKategorisi>("ariza-bakim");
  const [adSoyad, setAdSoyad] = useState("");
  const [telefon, setTelefon] = useState("");
  const [detay, setDetay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formGecerli =
    adSoyad.trim().length > 0 &&
    telefon.trim().length >= 10 &&
    detay.trim().length > 0;

  async function handleGonder() {
    if (!formGecerli) return;

    setIsSubmitting(true);
    try {
      const talep = await createRequest({
        kategori,
        aciklama: detay.trim(),
        adSoyad: adSoyad.trim(),
        telefon: telefon.trim(),
      });
      await takipNumarasiEkle(talep.id);
      Alert.alert(
        "Talebiniz Alındı",
        "Talebiniz oluşturuldu. Durumunu Taleplerim ekranından takip edebilirsiniz.",
      );
      navigation.navigate("Taleplerim" as never);
    } catch {
      Alert.alert(
        "Hata",
        "Talep gönderilirken bir hata oluştu. Tekrar deneyin.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Geri"
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Yeni Talep</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Kategori</Text>
          <SegmentedControl
            options={talepKategorileri}
            value={kategori}
            onChange={setKategori}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>İletişim Bilgileri</Text>
          <Card style={styles.contactCard}>
            <TextInput
              style={styles.input}
              placeholder="Ad Soyad"
              placeholderTextColor={colors.outline}
              value={adSoyad}
              onChangeText={setAdSoyad}
              accessibilityLabel="Ad Soyad"
            />
            <TextInput
              style={styles.input}
              placeholder="Telefon"
              placeholderTextColor={colors.outline}
              value={telefon}
              onChangeText={setTelefon}
              keyboardType="phone-pad"
              accessibilityLabel="Telefon"
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Talep Detayları</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Talebinizi buraya yazınız..."
            placeholderTextColor={colors.outline}
            multiline
            maxLength={MAX_LENGTH}
            value={detay}
            onChangeText={setDetay}
          />
          <Text style={styles.counter}>
            {detay.length} / {MAX_LENGTH}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ek Dosyalar</Text>
          <View style={styles.attachmentsRow}>
            {ekDosyaSecenekleri.map((secenek) => (
              <Pressable
                key={secenek.id}
                accessibilityRole="button"
                style={styles.attachmentItem}
              >
                <View style={styles.attachmentIcon}>
                  <MaterialIcons
                    name={secenek.icon}
                    size={22}
                    color={colors.secondary}
                  />
                </View>
                <Text style={styles.attachmentLabel} numberOfLines={1}>
                  {secenek.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.infoNote}>
          Talebiniz belediyemiz tarafından incelendikten sonra SMS ile
          bilgilendirme yapılacaktır.
        </Text>

        <PrimaryButton
          label={isSubmitting ? "Gönderiliyor..." : "Talebi Gönder"}
          onPress={handleGonder}
          disabled={isSubmitting || !formGecerli}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  headerTitle: {
    ...typography.titleLg,
    color: colors.onPrimary,
  },
  content: {
    flex: 1,
    padding: spacing.containerMargin,
    gap: spacing.stackGap,
  },
  section: {
    gap: spacing.stackGap / 2,
  },
  sectionLabel: {
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
    height: 80,
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
  attachmentsRow: {
    flexDirection: "row",
    gap: spacing.stackGap,
  },
  attachmentItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  attachmentIcon: {
    width: spacing.touchTargetMin,
    height: spacing.touchTargetMin,
    borderRadius: shape.rounded,
    backgroundColor: colors.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentLabel: {
    ...typography.labelSm,
    color: colors.onBackground,
    textAlign: "center",
  },
  infoNote: {
    ...typography.bodyMd,
    color: colors.outline,
  },
});
