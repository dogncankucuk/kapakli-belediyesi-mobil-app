import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, PrimaryButton, TopBar } from "../components";
import { useAppShell } from "../navigation/AppShellContext";
import { colors, spacing, typography } from "../theme";

type MenuItem = {
  key:
    | "HesapBilgilerim"
    | "Ayarlar"
    | "Hakkimizda"
    | "BizeUlasin"
    | "VefatEdenler"
    | "YardimMerkezi";
  icon: ComponentProps<typeof MaterialIcons>["name"];
  label: string;
};

const MENU_ITEMS: MenuItem[] = [
  { key: "HesapBilgilerim", icon: "badge", label: "Hesap Bilgilerim" },
  { key: "Ayarlar", icon: "settings", label: "Ayarlar" },
  { key: "Hakkimizda", icon: "info", label: "Hakkımızda" },
  { key: "BizeUlasin", icon: "call", label: "Bize Ulaşın" },
  { key: "VefatEdenler", icon: "local-florist", label: "Vefat Edenler" },
  { key: "YardimMerkezi", icon: "help", label: "Yardım Merkezi" },
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { openMenu } = useAppShell();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar
        title="Kapaklı Belediyesi"
        onMenuPress={openMenu}
        rightSlot={
          <MaterialIcons name="search" size={22} color={colors.onPrimary} />
        }
      />
      <View style={styles.content}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={40} color={colors.onPrimary} />
          </View>
          <Text style={styles.name}>Ahmet Yılmaz</Text>
          <Text style={styles.maskedInfo}>123*****890</Text>
        </View>

        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => navigation.navigate(item.key as never)}
              accessibilityRole="button"
            >
              {({ pressed }) => (
                <Card
                  style={[styles.menuCard, pressed && styles.menuCardPressed]}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={22}
                    color={colors.secondary}
                  />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={22}
                    color={colors.outline}
                  />
                </Card>
              )}
            </Pressable>
          ))}
        </View>

        <PrimaryButton label="Çıkış Yap" onPress={() => {}} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.containerMargin,
    gap: spacing.stackGap,
  },
  identity: {
    alignItems: "center",
    gap: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.stackGap / 2,
  },
  name: {
    ...typography.titleMd,
    color: colors.onBackground,
  },
  maskedInfo: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  menu: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.stackGap / 2,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.stackGap,
    minHeight: spacing.touchTargetMin,
    padding: spacing.stackGap,
  },
  menuCardPressed: {
    shadowOpacity: 0,
    elevation: 0,
  },
  menuLabel: {
    ...typography.labelLg,
    color: colors.onBackground,
    flex: 1,
  },
});
