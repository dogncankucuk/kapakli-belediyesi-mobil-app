import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ComponentProps, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import HaritaStack from "./HaritaStack";
import HomeStack from "./HomeStack";
import ProfileStack from "./ProfileStack";
import ServicesStack from "./ServicesStack";
import { useAppShell } from "./AppShellContext";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";
import { Colors, useThemeColors } from "../theme";

// PersistentBottomBar (disariya sunulan, her ekranda sabit alt bar) bu
// listeyi ve asagidaki iki bileseni RootTabs'in kendi native tab bar'i
// (asagida tabBarStyle:{display:'none'} ile gizlendi) yerine kullanir.
export const TAB_ITEMS: {
  name: "Home" | "Harita" | "Services" | "Profile";
  icon: ComponentProps<typeof MaterialIcons>["name"];
  labelKey: TranslationKey;
}[] = [
  { name: "Home", icon: "home", labelKey: "tabs_home" },
  { name: "Harita", icon: "map", labelKey: "tabs_map" },
  { name: "Services", icon: "apps", labelKey: "tabs_services" },
  { name: "Profile", icon: "person", labelKey: "tabs_profile" },
];

export function TabLabel({ tKey, color }: { tKey: TranslationKey; color: string }) {
  const { t } = useTranslation();
  return (
    <Text
      style={{ color, fontSize: 11, fontWeight: "500", textAlign: "center" }}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.75}
    >
      {t(tKey)}
    </Text>
  );
}

// Bos, hicbir zaman render edilmeyen bir "sekme" - orta FAB butonu
// gercek bir ekrana degil, CreateActionSheet'i acan bir tabPress
// listener'ina bagli (bkz. asagidaki listeners + AppShellContext).
function EmptyFabScreen() {
  return null;
}

export function FabTabButton() {
  const { openCreateSheet } = useAppShell();
  const colors = useThemeColors();
  const styles = useMemo(() => createFabStyles(colors), [colors]);
  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={openCreateSheet}
        accessibilityRole="button"
        accessibilityLabel="Oluştur"
        style={styles.fab}
      >
        <MaterialIcons name="add" size={28} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
}

const createFabStyles = (colors: Colors) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    fab: {
      width: 52,
      height: 52,
      borderRadius: 26,
      marginTop: -20,
      backgroundColor: colors.primaryContainer,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
  });

const RootTabs = createBottomTabNavigator({
  screenOptions: {
    headerShown: false,
    // Native tab bar gizli - gorsel alt bar artik navigation/PersistentBottomBar.tsx
    // tarafindan, tum ekranlarin (bu sekmelerin disindaki kok-stack ekranlari dahil)
    // ustunde sabit olarak veriliyor. Sekme/stack yapisinin kendisi (her sekmenin
    // kendi ic navigasyon gecmisini tutmasi) degismedi, sadece gorunen bar degisti.
    tabBarStyle: { display: "none" },
  },
  screens: {
    Home: {
      screen: HomeStack,
      options: {
        tabBarLabel: ({ color }) => <TabLabel tKey="tabs_home" color={color} />,
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="home" color={color} size={size} />
        ),
      },
    },
    Harita: {
      screen: HaritaStack,
      options: {
        tabBarLabel: ({ color }) => <TabLabel tKey="tabs_map" color={color} />,
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="map" color={color} size={size} />
        ),
      },
    },
    Olustur: {
      screen: EmptyFabScreen,
      options: {
        tabBarLabel: () => null,
        tabBarButton: () => <FabTabButton />,
      },
      listeners: {
        tabPress: (event) => {
          event.preventDefault();
        },
      },
    },
    Services: {
      screen: ServicesStack,
      options: {
        tabBarLabel: ({ color }) => (
          <TabLabel tKey="tabs_services" color={color} />
        ),
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="apps" color={color} size={size} />
        ),
      },
    },
    Profile: {
      screen: ProfileStack,
      options: {
        tabBarLabel: ({ color }) => (
          <TabLabel tKey="tabs_profile" color={color} />
        ),
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="person" color={color} size={size} />
        ),
      },
      listeners: ({ navigation }) => ({
        tabPress: () => {
          navigation.navigate("Profile", { screen: "ProfileMain" } as never);
        },
      }),
    },
  },
});

export default RootTabs;
