import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ComponentProps, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GuncelIcerikKategori } from "../api/guncelIcerik";
import { Card, TopBar } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";
import { useAppShell } from "../navigation/AppShellContext";
import { Colors, spacing, typography, useThemeColors } from "../theme";

type HubItem =
  | {
      labelKey: TranslationKey;
      icon: IconName;
      screen: "GuncelIcerik";
      kategori: GuncelIcerikKategori;
    }
  | {
      labelKey: TranslationKey;
      icon: IconName;
      screen: "MeclisGundemleri" | "MeclisKararlari";
    };

type IconName = ComponentProps<typeof MaterialIcons>["name"];

const HUB_ITEMS: HubItem[] = [
  {
    labelKey: "guncel_haberler",
    icon: "article",
    screen: "GuncelIcerik",
    kategori: "haberler",
  },
  {
    labelKey: "guncel_duyurular",
    icon: "campaign",
    screen: "GuncelIcerik",
    kategori: "duyurular",
  },
  {
    labelKey: "guncel_ilanlar",
    icon: "assignment",
    screen: "GuncelIcerik",
    kategori: "ilanlar",
  },
  {
    labelKey: "guncel_ihaleler",
    icon: "gavel",
    screen: "GuncelIcerik",
    kategori: "ihaleler",
  },
  {
    labelKey: "guncel_meclisGundemleri",
    icon: "event-note",
    screen: "MeclisGundemleri",
  },
  {
    labelKey: "guncel_meclisKararlari",
    icon: "how-to-vote",
    screen: "MeclisKararlari",
  },
  {
    labelKey: "guncel_makaleler",
    icon: "menu-book",
    screen: "GuncelIcerik",
    kategori: "makaleler",
  },
];

export default function AnnouncementsScreen() {
  const navigation = useNavigation();
  const { openMenu } = useAppShell();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePress = (item: HubItem) => {
    if (item.screen === "GuncelIcerik") {
      const navigateWithParams = navigation.navigate as (
        screen: string,
        params: { kategori: GuncelIcerikKategori },
      ) => void;
      navigateWithParams("GuncelIcerik", { kategori: item.kategori });
    } else {
      navigation.navigate(item.screen as never);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar title={t("guncel_title")} onMenuPress={openMenu} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {HUB_ITEMS.map((item) => (
          <Pressable
            key={item.labelKey}
            onPress={() => handlePress(item)}
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
                <Text style={styles.menuLabel}>{t(item.labelKey)}</Text>
                <MaterialIcons
                  name="chevron-right"
                  size={22}
                  color={colors.outline}
                />
              </Card>
            )}
          </Pressable>
        ))}
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
