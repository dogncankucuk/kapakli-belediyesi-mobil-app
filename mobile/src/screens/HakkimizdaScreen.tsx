import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../components";
import { colors, shape, spacing, typography } from "../theme";

export default function HakkimizdaScreen() {
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
        <Text style={styles.headerTitle}>Kapaklı Belediyesi</Text>
        <MaterialIcons name="search" size={22} color={colors.onBackground} />
      </View>

      <View style={styles.content}>
        <View style={styles.hero}>
          <MaterialIcons
            name="account-balance"
            size={28}
            color={colors.onPrimary}
          />
          <Text style={styles.heroTitle}>Hakkımızda</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="groups" size={18} color={colors.secondary} />
            <Text style={styles.cardTitle}>Başkanımız — Mustafa Çetin</Text>
          </View>
          <Text style={styles.paragraph}>
            1968 Bulgaristan-Şumnu doğumlu, Yıldız Teknik Üniversitesi Endüstri
            Mühendisliği mezunu. 1994-1999 Kapaklı Belediye Meclis Üyeliği ve
            belde başkanlıklarının ardından 31 Mart 2019 yerel seçimlerinde
            Kapaklı Belediye Başkanı seçilmiştir.
          </Text>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons
              name="history-edu"
              size={18}
              color={colors.secondary}
            />
            <Text style={styles.cardTitle}>Kapaklı&apos;nın Tarihçesi</Text>
          </View>
          <Text style={styles.paragraph} numberOfLines={4}>
            Kapaklı, adını eski belediye meydanındaki su kuyusundan alır. Sultan
            II. Abdülhamit döneminde göç edenlerce kurulmuş, köy camisi
            1904&apos;te inşa edilmiştir. 1986&apos;da belde statüsü kazanmış,
            06.12.2012&apos;de 6360 sayılı yasayla ilçe olmuştur.
          </Text>
        </Card>

        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>1986</Text>
            <Text style={styles.statLabel}>Belediye</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>2012</Text>
            <Text style={styles.statLabel}>İlçe Oldu</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statValue}>147.610</Text>
            <Text style={styles.statLabel}>Nüfus (2025)</Text>
          </View>
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
    gap: spacing.stackGap,
  },
  hero: {
    minHeight: 96,
    borderRadius: shape.rounded,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  heroTitle: {
    ...typography.titleLg,
    color: colors.onPrimary,
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
  paragraph: {
    ...typography.bodyMd,
    color: colors.onBackground,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.stackGap / 2,
  },
  statBadge: {
    flex: 1,
    minHeight: spacing.touchTargetMin,
    borderRadius: shape.rounded,
    backgroundColor: colors.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    ...typography.titleMd,
    color: colors.primaryContainer,
  },
  statLabel: {
    ...typography.labelSm,
    color: colors.primaryContainer,
  },
});
