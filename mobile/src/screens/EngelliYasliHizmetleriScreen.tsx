import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ComponentProps } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, SecondaryButton } from "../components";
import { colors, shape, spacing, typography } from "../theme";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

type Hizmet = {
  id: string;
  icon: IconName;
  title: string;
  description: string;
};

// kapakli.bel.tr/hizmetlerimiz/evde-bakim-hizmeti sayfasindaki gercek
// hizmet kapsamindan alinmistir (2026-07-22 itibariyle).
const hizmetler: Hizmet[] = [
  {
    id: "evde-bakim",
    icon: "home",
    title: "Evde Bakım Hizmeti",
    description:
      "65 yaş üstü ve bakıma muhtaç/engelli, yalnız veya eşiyle yaşayan Kapaklı sakinlerine sağlık-kişisel bakım, psikolojik destek ve ev temizliği (hafta içi 08:30-16:30).",
  },
  {
    id: "sosyal-hizmetler",
    icon: "volunteer-activism",
    title: "Sosyal Hizmetler Müdürlüğü",
    description:
      "Sosyal yardım, Sevgi Eli Yardım Mağazaları ve psikolojik danışmanlık hizmetleri için başvuru kanalı.",
  },
];

export default function EngelliYasliHizmetleriScreen() {
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
        <Text style={styles.headerTitle}>Engelli ve Yaşlı Hizmetleri</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Kapaklı Belediyesi her an yanınızda. İhtiyacınız olan hizmeti seçip
          kolayca başvurun.
        </Text>

        {hizmetler.map((hizmet) => (
          <Card key={hizmet.id} style={styles.hizmetCard}>
            <View style={styles.hizmetIcon}>
              <MaterialIcons
                name={hizmet.icon}
                size={22}
                color={colors.onPrimary}
              />
            </View>
            <View style={styles.hizmetInfo}>
              <Text style={styles.hizmetTitle}>{hizmet.title}</Text>
              <Text style={styles.hizmetDescription} numberOfLines={2}>
                {hizmet.description}
              </Text>
            </View>
            <SecondaryButton
              label="Başvur"
              onPress={() => Linking.openURL("tel:4448059")}
              style={styles.applyButton}
            />
          </Card>
        ))}

        <Text style={styles.infoNote}>
          Başvuru için Çağrı Merkezi&apos;ni (444 80 59) arayabilir veya
          belediyenin online başvuru sistemini kullanabilirsiniz.
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
    flexShrink: 1,
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
  hizmetCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.stackGap,
    padding: spacing.stackGap,
  },
  hizmetIcon: {
    width: 40,
    height: 40,
    borderRadius: shape.rounded,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  hizmetInfo: {
    flex: 1,
    gap: 2,
  },
  hizmetTitle: {
    ...typography.labelLg,
    color: colors.onBackground,
  },
  hizmetDescription: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  applyButton: {
    minHeight: spacing.touchTargetMin - 8,
    paddingHorizontal: spacing.stackGap,
  },
  infoNote: {
    ...typography.bodyMd,
    color: colors.outline,
  },
});
