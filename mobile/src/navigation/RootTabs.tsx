import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import AnnouncementsStack from "./AnnouncementsStack";
import HomeStack from "./HomeStack";
import MapStack from "./MapStack";
import ProfileStack from "./ProfileStack";
import ServicesStack from "./ServicesStack";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";

function TabLabel({ tKey, color }: { tKey: TranslationKey; color: string }) {
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

const RootTabs = createBottomTabNavigator({
  screenOptions: {
    headerShown: false,
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
    Map: {
      screen: MapStack,
      options: {
        tabBarLabel: ({ color }) => <TabLabel tKey="tabs_map" color={color} />,
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="map" color={color} size={size} />
        ),
      },
    },
    Announcements: {
      screen: AnnouncementsStack,
      options: {
        tabBarLabel: ({ color }) => (
          <TabLabel tKey="tabs_announcements" color={color} />
        ),
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="campaign" color={color} size={size} />
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
