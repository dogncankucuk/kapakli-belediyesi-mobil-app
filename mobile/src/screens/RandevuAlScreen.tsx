import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ComponentProps, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createAppointment } from "../api/appointments";
import { Card, PrimaryButton, SecondaryButton } from "../components";
import { colors, shape, spacing, typography } from "../theme";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

type RandevuKategori = {
  id: string;
  icon: IconName;
  badge: string;
  title: string;
  description: string;
};

const kategoriler: RandevuKategori[] = [
  {
    id: "nikah-dairesi",
    icon: "favorite",
    badge: "Evlilik İşlemleri",
    title: "Nikah Dairesi",
    description: "Evlilik başvurusu, gün alma ve nikah akdi randevuları için.",
  },
  {
    id: "spor-salonlari",
    icon: "fitness-center",
    badge: "Sağlıklı Yaşam",
    title: "Spor Salonları",
    description: "Belediye tesisleri için bireysel veya grup randevuları için.",
  },
];

export default function RandevuAlScreen() {
  const navigation = useNavigation();
  const [selectedKategori, setSelectedKategori] =
    useState<RandevuKategori | null>(null);
  const [tarih, setTarih] = useState("");
  const [saat, setSaat] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleVazgec() {
    setSelectedKategori(null);
    setTarih("");
    setSaat("");
  }

  async function handleOnayla() {
    if (!selectedKategori) {
      return;
    }
    setIsSubmitting(true);
    try {
      await createAppointment({
        hizmetTuru: selectedKategori.title,
        tarih,
        saat,
      });
      Alert.alert("Başarılı", "Randevunuz oluşturuldu.");
      handleVazgec();
    } catch {
      Alert.alert("Hata", "Bir hata oluştu.");
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
        <Text style={styles.headerTitle}>Randevu Al</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Kapaklı Dijital Belediye</Text>

        {!selectedKategori &&
          kategoriler.map((kategori) => (
            <Card key={kategori.id} style={styles.card}>
              <View style={styles.imagePlaceholder}>
                <MaterialIcons
                  name={kategori.icon}
                  size={32}
                  color={colors.onPrimary}
                />
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{kategori.badge}</Text>
              </View>
              <Text style={styles.title}>{kategori.title}</Text>
              <View style={styles.footer}>
                <Text style={styles.description} numberOfLines={1}>
                  {kategori.description}
                </Text>
                <PrimaryButton
                  label="Randevu Seç"
                  onPress={() => setSelectedKategori(kategori)}
                  style={styles.selectButton}
                />
              </View>
            </Card>
          ))}

        {selectedKategori && (
          <Card style={styles.card}>
            <Text style={styles.title}>{selectedKategori.title}</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Tarih (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={tarih}
                onChangeText={setTarih}
                placeholder="2026-07-20"
                placeholderTextColor={colors.outline}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Saat (HH:mm)</Text>
              <TextInput
                style={styles.input}
                value={saat}
                onChangeText={setSaat}
                placeholder="14:30"
                placeholderTextColor={colors.outline}
              />
            </View>
            <View style={styles.formActions}>
              <SecondaryButton
                label="Vazgeç"
                onPress={handleVazgec}
                disabled={isSubmitting}
                style={styles.formButton}
              />
              <PrimaryButton
                label="Onayla"
                onPress={handleOnayla}
                disabled={isSubmitting || !tarih || !saat}
                style={styles.formButton}
              />
            </View>
          </Card>
        )}
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
  subtitle: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  card: {
    padding: spacing.stackGap,
    gap: spacing.stackGap / 2,
  },
  imagePlaceholder: {
    height: 72,
    borderRadius: shape.rounded,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.stackGap / 2,
    paddingVertical: 4,
    borderRadius: shape.rounded,
    backgroundColor: colors.secondaryContainer,
  },
  badgeText: {
    ...typography.labelSm,
    color: colors.primaryContainer,
  },
  title: {
    ...typography.titleMd,
    color: colors.onBackground,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.stackGap,
  },
  description: {
    ...typography.bodyMd,
    color: colors.outline,
    flex: 1,
  },
  selectButton: {
    minHeight: spacing.touchTargetMin - 8,
    paddingHorizontal: spacing.stackGap,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    ...typography.labelSm,
    color: colors.outline,
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
  formActions: {
    flexDirection: "row",
    gap: spacing.stackGap,
  },
  formButton: {
    flex: 1,
  },
});
