import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KULLANIM_SARTLARI_METNI, KVKK_METNI } from "../content/kvkkMetni";
import { Colors, spacing, typography, useThemeColors } from "../theme";
import SegmentedControl from "./SegmentedControl";

type Sekme = "kvkk" | "sartlar";

type Props = {
  onBack: () => void;
};

export function KvkkMetniContent({ onBack }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [sekme, setSekme] = useState<Sekme>("kvkk");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Geri"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.onBackground}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Gizlilik ve Kullanım Şartları</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabWrapper}>
        <SegmentedControl
          options={[
            { label: "KVKK Aydınlatma Metni", value: "kvkk" },
            { label: "Kullanım Şartları", value: "sartlar" },
          ]}
          value={sekme}
          onChange={setSekme}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.bodyText}>
          {sekme === "kvkk" ? KVKK_METNI : KULLANIM_SARTLARI_METNI}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
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
    tabWrapper: {
      paddingHorizontal: spacing.containerMargin,
      paddingBottom: spacing.stackGap,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: spacing.containerMargin,
      paddingBottom: spacing.stackGap,
    },
    bodyText: {
      ...typography.bodyMd,
      color: colors.onBackground,
      lineHeight: 22,
    },
  });
