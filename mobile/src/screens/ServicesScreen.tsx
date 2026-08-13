import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryIconCard, TopBar } from "../components";
import {
  navigateToServiceTarget,
  SERVICE_CATALOG,
  ServiceId,
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

// Bu ekrandan kaldirilmasi istenen kisayollar - hala SERVICE_CATALOG'da
// (Hizli Islemler duzenleyicisinde secilebilir olarak) kaliyorlar.
const HIDDEN_ON_SERVICES_SCREEN: ServiceId[] = [
  "yeni-talep",
  "taleplerim",
  "etkinlik-tarihleri",
  "hakkimizda",
  "meclis-kararlari",
];

export default function ServicesScreen() {
  const navigation = useNavigation();
  const { openMenu } = useAppShell();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visibleServices = useMemo(
    () =>
      SERVICE_CATALOG.filter(
        (service) => !HIDDEN_ON_SERVICES_SCREEN.includes(service.id),
      ),
    [],
  );

  const filteredServices = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return visibleServices;
    return visibleServices.filter((service) =>
      t(service.labelKey).toLocaleLowerCase("tr-TR").includes(q),
    );
  }, [visibleServices, query, t]);

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
          <Pressable
            onPress={toggleSearch}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("common_search")}
          >
            <MaterialIcons
              name={isSearchOpen ? "close" : "search"}
              size={24}
              color={colors.onPrimary}
            />
          </Pressable>
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
