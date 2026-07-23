import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../components";
import { colors, spacing, typography } from "../theme";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

type Institution = {
  id: string;
  icon: IconName;
  name: string;
  description: string;
  onPress?: () => void;
};

export default function FaturaOdemeScreen() {
  const navigation = useNavigation();

  const institutions: Institution[] = [
    {
      id: "teski",
      icon: "water-drop",
      name: "TESKİ",
      description: "Su ve Kanalizasyon",
      onPress: () => navigation.navigate("SuHizmetleri" as never),
    },
    {
      id: "gazdas",
      icon: "local-fire-department",
      name: "GAZDAŞ",
      description: "Doğal Gaz",
    },
    {
      id: "trepas",
      icon: "bolt",
      name: "TREPAŞ",
      description: "Elektrik Dağıtım",
    },
  ];

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
        <Text style={styles.headerTitle}>Fatura Ödeme</Text>
      </View>

      <View style={styles.content}>
        <View>
          <Text style={styles.title}>Ödeme Yapılacak Kurum</Text>
          <Text style={styles.subtitle}>
            Hızlı ve güvenli ödeme için kurum seçiniz.
          </Text>
        </View>

        <View style={styles.grid}>
          {institutions.map((institution) => (
            <Pressable
              key={institution.id}
              onPress={institution.onPress}
              accessibilityRole="button"
              style={styles.gridItem}
            >
              {({ pressed }) => (
                <Card style={[styles.card, pressed && styles.cardPressed]}>
                  <View style={styles.iconCircle}>
                    <MaterialIcons
                      name={institution.icon}
                      size={24}
                      color={colors.primaryContainer}
                    />
                  </View>
                  <Text style={styles.institutionName}>{institution.name}</Text>
                  <Text style={styles.institutionDescription}>
                    {institution.description}
                  </Text>
                </Card>
              )}
            </Pressable>
          ))}

          <View style={styles.gridItem}>
            <Card style={styles.otherCard}>
              <View style={styles.iconCircle}>
                <MaterialIcons
                  name="more-horiz"
                  size={24}
                  color={colors.outline}
                />
              </View>
              <Text style={styles.otherLabel}>Diğer Kurumlar</Text>
            </Card>
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
    gap: spacing.containerMargin,
  },
  title: {
    ...typography.titleLg,
    color: colors.onBackground,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.gridGutter,
  },
  gridItem: {
    width: "47%",
  },
  card: {
    aspectRatio: 1,
    justifyContent: "center",
    gap: spacing.stackGap / 2,
    padding: spacing.containerMargin,
  },
  cardPressed: {
    shadowOpacity: 0,
    elevation: 0,
  },
  otherCard: {
    aspectRatio: 1,
    justifyContent: "center",
    gap: spacing.stackGap / 2,
    padding: spacing.containerMargin,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderStyle: "dashed",
    shadowOpacity: 0,
    elevation: 0,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  institutionName: {
    ...typography.titleMd,
    color: colors.onBackground,
  },
  institutionDescription: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  otherLabel: {
    ...typography.labelLg,
    color: colors.outline,
  },
});
