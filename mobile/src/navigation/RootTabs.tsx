import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AnnouncementsStack from "./AnnouncementsStack";
import HomeStack from "./HomeStack";
import MapStack from "./MapStack";
import ProfileStack from "./ProfileStack";
import ServicesStack from "./ServicesStack";
import { colors } from "../theme";

const RootTabs = createBottomTabNavigator({
  screenOptions: {
    headerShown: false,
    tabBarActiveTintColor: colors.primaryContainer,
    tabBarInactiveTintColor: colors.outline,
  },
  screens: {
    Home: {
      screen: HomeStack,
      options: {
        title: "Ana Sayfa",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="home" color={color} size={size} />
        ),
      },
    },
    Services: {
      screen: ServicesStack,
      options: {
        title: "Hizmetler",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="apps" color={color} size={size} />
        ),
      },
    },
    Map: {
      screen: MapStack,
      options: {
        title: "Harita",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="map" color={color} size={size} />
        ),
      },
    },
    Announcements: {
      screen: AnnouncementsStack,
      options: {
        title: "Duyurular",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="campaign" color={color} size={size} />
        ),
      },
    },
    Profile: {
      screen: ProfileStack,
      options: {
        title: "Profil",
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="person" color={color} size={size} />
        ),
      },
    },
  },
});

export default RootTabs;
