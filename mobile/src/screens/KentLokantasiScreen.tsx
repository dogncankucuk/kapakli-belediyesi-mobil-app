import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getGununMenusu } from "../api/kentLokantasi";
import { GununMenusu } from "../api/types";
import { Card, SecondaryButton } from "../components";
import { colors, shape, spacing, typography } from "../theme";

export default function KentLokantasiScreen() {
  const navigation = useNavigation();
  const [menu, setMenu] = useState<GununMenusu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getGununMenusu()
      .then(setMenu)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Geri dön"
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Kent Lokantası</Text>
      </View>
      <View style={styles.content}>
        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>Günün menüsü yüklenemedi.</Text>
        )}
        {!isLoading && !error && !menu && (
          <Text style={styles.emptyText}>Bugün için menü girilmemiş.</Text>
        )}

        {!isLoading && !error && menu && (
          <>
            <Card style={styles.menuCard}>
              <Text style={styles.todayBadge}>BUGÜN</Text>
              <Text style={styles.todayTitle}>Günün Menüsü</Text>
              <Text style={styles.price}>₺{menu.fiyat}</Text>
            </Card>

            <View style={styles.menuList}>
              {menu.kalemler.map((item, index) => (
                <View key={`${item.ad}-${index}`} style={styles.menuItem}>
                  <MaterialIcons
                    name="restaurant"
                    size={18}
                    color={colors.secondary}
                  />
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemName} numberOfLines={1}>
                      {item.ad}
                    </Text>
                    <Text style={styles.menuItemDescription} numberOfLines={1}>
                      {item.aciklama}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.infoRow}>
          <Card style={styles.infoCard}>
            <MaterialIcons
              name="location-on"
              size={18}
              color={colors.secondary}
            />
            <Text style={styles.infoText} numberOfLines={2}>
              Cumhuriyet Mah. Vatan Cad. No:12
            </Text>
            <SecondaryButton
              label="Haritada Gör"
              onPress={() => navigation.navigate("Map" as never)}
            />
          </Card>
          <Card style={styles.infoCard}>
            <MaterialIcons name="schedule" size={18} color={colors.secondary} />
            <Text style={styles.infoText}>12:00 - 15:30</Text>
            <Text style={styles.openText}>Şu an açık</Text>
          </Card>
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
  backButton: {
    width: spacing.touchTargetMin,
    height: spacing.touchTargetMin,
    marginLeft: -spacing.stackGap,
    alignItems: "center",
    justifyContent: "center",
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
  errorText: {
    ...typography.bodyMd,
    color: colors.error,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  menuCard: {
    padding: spacing.stackGap,
    gap: 2,
    backgroundColor: colors.primaryContainer,
  },
  todayBadge: {
    ...typography.labelSm,
    color: colors.secondaryContainer,
  },
  todayTitle: {
    ...typography.titleMd,
    color: colors.onPrimary,
  },
  price: {
    ...typography.headlineMdMobile,
    color: colors.onPrimary,
  },
  menuList: {
    flex: 1,
    justifyContent: "space-between",
    gap: spacing.stackGap / 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.stackGap,
    paddingVertical: spacing.stackGap / 2,
    paddingHorizontal: spacing.stackGap,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: shape.rounded,
  },
  menuItemText: {
    flex: 1,
    gap: 2,
  },
  menuItemName: {
    ...typography.labelLg,
    color: colors.onBackground,
  },
  menuItemDescription: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  infoRow: {
    flexDirection: "row",
    gap: spacing.gridGutter,
  },
  infoCard: {
    flex: 1,
    padding: spacing.stackGap,
    gap: 4,
  },
  infoText: {
    ...typography.bodyMd,
    color: colors.onBackground,
  },
  openText: {
    ...typography.labelSm,
    color: colors.secondary,
  },
});
