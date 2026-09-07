import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryIconCard, HavaVeAramaSag, TopBar } from "../components";
import {
  navigateToServiceTarget,
  VISIBLE_SERVICE_CATALOG,
} from "../constants/serviceCatalog";
import { useTranslation } from "../i18n/LocaleContext";
import { useAppShell } from "../navigation/AppShellContext";
import {
  Colors,
  donguselKategoriPaleti,
  shape,
  spacing,
  typography,
  useThemeColors,
} from "../theme";

export default function ServicesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { openMenu } = useAppShell();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const acSearch = (route.params as { acSearch?: boolean } | undefined)
    ?.acSearch;
  const [isSearchOpen, setIsSearchOpen] = useState(!!acSearch);
  const [query, setQuery] = useState("");

  const filteredServices = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return VISIBLE_SERVICE_CATALOG;
    return VISIBLE_SERVICE_CATALOG.filter((service) =>
      t(service.labelKey).toLocaleLowerCase("tr-TR").includes(q),
    );
  }, [query, t]);

  const toggleSearch = () => {
    setIsSearchOpen((open) => !open);
    setQuery("");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar
        title={t("common_appName")}
        onMenuPress={openMenu}
        rightSlot={
          <HavaVeAramaSag onSearchPress={toggleSearch} searchActive={isSearchOpen} />
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

        {isSearchOpen && (
          <View style={styles.searchRow}>
            <MaterialIcons name="search" size={20} color={colors.outline} />
            <TextInput
              style={styles.searchInput}
              placeholder={t("services_searchPlaceholder")}
              placeholderTextColor={colors.outline}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
          </View>
        )}

        {filteredServices.length === 0 ? (
          <Text style={styles.emptyText}>{t("services_searchEmpty")}</Text>
        ) : (
          <View style={styles.grid}>
            {filteredServices.map((service, index) => (
              <View key={service.id} style={styles.gridItem}>
                <CategoryIconCard
                  icon={service.icon}
                  label={t(service.labelKey)}
                  accent={
                    donguselKategoriPaleti[
                      index % donguselKategoriPaleti.length
                    ]
                  }
                  onPress={() =>
                    navigateToServiceTarget(navigation, service.target)
                  }
                />
              </View>
            ))}
          </View>
        )}
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
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: shape.roundedLg,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      paddingHorizontal: spacing.stackGap,
      minHeight: spacing.touchTargetMin,
    },
    searchInput: {
      ...typography.bodyLg,
      color: colors.onBackground,
      flex: 1,
    },
    emptyText: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.gridGutter,
    },
    gridItem: {
      width: "48%",
    },
  });
