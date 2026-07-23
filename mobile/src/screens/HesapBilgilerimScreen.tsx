import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../components";
import { colors, shape, spacing, typography } from "../theme";

export default function HesapBilgilerimScreen() {
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
        <Text style={styles.headerTitle}>Hesap Bilgilerim</Text>
        <MaterialIcons name="search" size={22} color={colors.onBackground} />
      </View>

      <View style={styles.content}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={28} color={colors.onPrimary} />
          </View>
          <View>
            <Text style={styles.name}>Ahmet Yılmaz</Text>
            <Text style={styles.subtitle}>T.C. No: 12345678901</Text>
          </View>
        </View>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="badge" size={18} color={colors.secondary} />
            <Text style={styles.cardTitle}>Kişisel Bilgiler</Text>
          </View>
          <View style={styles.fieldRow}>
            <View style={styles.field}>
              <Text style={styles.label}>Ad</Text>
              <TextInput style={styles.input} value="Ahmet" editable={false} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Soyad</Text>
              <TextInput style={styles.input} value="Yılmaz" editable={false} />
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="call" size={18} color={colors.secondary} />
            <Text style={styles.cardTitle}>İletişim Bilgileri</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Telefon Numarası</Text>
            <TextInput
              style={styles.input}
              value="+90 532 123 45 67"
              editable={false}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="lock" size={18} color={colors.secondary} />
            <Text style={styles.cardTitle}>Güvenlik</Text>
          </View>
          <Pressable style={styles.securityRow} accessibilityRole="button">
            <MaterialIcons
              name="vpn-key"
              size={18}
              color={colors.onBackground}
            />
            <Text style={styles.securityLabel}>Şifre Değiştir</Text>
            <MaterialIcons
              name="chevron-right"
              size={18}
              color={colors.outline}
            />
          </Pressable>
        </Card>
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
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.stackGap,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
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
