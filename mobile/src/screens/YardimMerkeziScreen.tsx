import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../components";
import { colors, spacing, typography } from "../theme";

const sorular = [
  "Su borcu nasıl ödenir?",
  "Randevu nasıl alınır?",
  "Talep durumumu nasıl takip ederim?",
  "Nöbetçi eczaneye nasıl ulaşırım?",
  "Şifremi nasıl değiştiririm?",
];

export default function YardimMerkeziScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Geri dön"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.onBackground}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Yardım Merkezi</Text>
        <MaterialIcons name="search" size={22} color={colors.onBackground} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Popüler Sorular</Text>
        <View style={styles.list}>
          {sorular.map((soru) => (
            <Pressable key={soru} accessibilityRole="button">
              <Card style={styles.card}>
                <Text style={styles.question} numberOfLines={1}>
                  {soru}
                </Text>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={colors.outline}
                />
              </Card>
            </Pressable>
          ))}
        </View>
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
    gap: spacing.stackGap / 2,
  },
  sectionTitle: {
    ...typography.labelLg,
    color: colors.onBackground,
  },
  list: {
    gap: spacing.stackGap / 2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: spacing.touchTargetMin,
    padding: spacing.stackGap,
  },
  question: {
    ...typography.bodyLg,
    color: colors.onBackground,
    flex: 1,
  },
});
