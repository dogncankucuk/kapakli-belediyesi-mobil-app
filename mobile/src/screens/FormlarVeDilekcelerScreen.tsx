import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ComponentProps } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../components";
import { colors, shape, spacing, typography } from "../theme";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

type Form = {
  id: string;
  icon: IconName;
  title: string;
  description: string;
  url: string;
};

// kapakli.bel.tr/kapakli/formlar/basvuru-formlari sayfasindaki gercek
// basvuru formlari (2026-07-22 itibariyle) - site bunlari kategoriye
// ayirmiyor, o yuzden tek liste olarak gosteriliyor.
const formlar: Form[] = [
  {
    id: "yaz-etkinlikleri",
    icon: "school",
    title: "Çocuklar İçin Yaz Etkinlikleri Kursu",
    description: '"Keşfet - Öğren - Güçlen" yaz kursu başvuru formu.',
    url: "https://www.kapakli.bel.tr/kapakli/formlar/basvuru-formlari/cocuklar-icin-yaz-etkinlikleri-kursu-kesfet-ogren-guclen",
  },
  {
    id: "evlilik-oncesi-egitim",
    icon: "favorite",
    title: "Evlilik Öncesi Eğitim Programı",
    description: "Evlilik öncesi eğitim programı başvuru formu.",
    url: "https://www.kapakli.bel.tr/kapakli/formlar/basvuru-formlari/evlilik-oncesi-egitim-programi-basvuru-formu",
  },
  {
    id: "cevre-gonullusu",
    icon: "eco",
    title: "Çevre Gönüllüsü Başvuru Formu",
    description: "Çevre gönüllüsü olmak için başvuru formu.",
    url: "https://www.kapakli.bel.tr/kapakli/formlar/basvuru-formlari/cevre-gonullusu-basvuru-formu",
  },
  {
    id: "okul-olgunlugu-testi",
    icon: "assignment",
    title: "Metropolitan Okul Olgunluğu Testi",
    description: "Okul olgunluğu testi başvuru formu.",
    url: "https://www.kapakli.bel.tr/kapakli/formlar/basvuru-formlari/metropolitan-okul-olgunlugu-testi-basvuru-formu-1752750144",
  },
];

export default function FormlarVeDilekcelerScreen() {
  const navigation = useNavigation();

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
        <Text style={styles.headerTitle}>Formlar ve Dilekçeler</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Güncel başvuru formlarına buradan ulaşabilir, doldurup online
          gönderebilirsiniz.
        </Text>

        <View style={styles.list}>
          {formlar.map((form) => (
            <Pressable
              key={form.id}
              onPress={() => Linking.openURL(form.url)}
              accessibilityRole="button"
            >
              <Card style={styles.formCard}>
                <View style={styles.formIcon}>
                  <MaterialIcons
                    name={form.icon}
                    size={22}
                    color={colors.onPrimary}
                  />
                </View>
                <View style={styles.formInfo}>
                  <Text style={styles.formTitle} numberOfLines={1}>
                    {form.title}
                  </Text>
                  <Text style={styles.formDescription} numberOfLines={1}>
                    {form.description}
                  </Text>
                </View>
                <MaterialIcons
                  name="open-in-new"
                  size={20}
                  color={colors.secondary}
                />
              </Card>
            </Pressable>
          ))}
        </View>

        <Text style={styles.infoNote}>
          Diğer resmi işlemler (imar, ruhsat, nikah vb.) için Hizmetler
          sekmesindeki ilgili kartları veya kapakli.bel.tr üzerindeki e-belediye
          sistemini kullanabilirsiniz.
        </Text>
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
  list: {
    gap: spacing.stackGap,
  },
  formCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.stackGap,
    padding: spacing.stackGap,
  },
  formIcon: {
    width: 40,
    height: 40,
    borderRadius: shape.rounded,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  formInfo: {
    flex: 1,
  },
  formTitle: {
    ...typography.labelLg,
    color: colors.onBackground,
  },
  formDescription: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  infoNote: {
    ...typography.bodyMd,
    color: colors.outline,
  },
});
