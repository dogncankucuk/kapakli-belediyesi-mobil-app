import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ServiceGridCard, TopBar } from "../components";
import {
  navigateToServiceTarget,
  SERVICE_CATALOG,
} from "../constants/serviceCatalog";
import { useTranslation } from "../i18n/LocaleContext";
import { useAppShell } from "../navigation/AppShellContext";
import { Colors, spacing, typography, useThemeColors } from "../theme";

export default function ServicesScreen() {
  const navigation = useNavigation();
  const { openMenu } = useAppShell();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar
        title={t("common_appName")}
        onMenuPress={openMenu}
        rightSlot={
          <MaterialIcons name="search" size={24} color={colors.onPrimary} />
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.title}>{t("services_title")}</Text>
          <Text style={styles.subtitle}>{t("services_subtitle")}</Text>
        </View>

        <View style={styles.grid}>
          {SERVICE_CATALOG.map((service) => (
            <View key={service.id} style={styles.gridItem}>
              <ServiceGridCard
                icon={service.icon}
                label={t(service.labelKey)}
                onPress={() =>
                  navigateToServiceTarget(navigation, service.target)
                }
              />
            </View>
          ))}
        </View>
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
    content: {
      padding: spacing.containerMargin,
      gap: spacing.containerMargin,
    },
    title: {
      ...typography.headlineMdMobile,
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
      width: "31%",
    },
  });
