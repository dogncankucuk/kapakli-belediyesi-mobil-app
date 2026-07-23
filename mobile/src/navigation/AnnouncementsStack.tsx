import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AnnouncementsScreen from "../screens/AnnouncementsScreen";
import HaberlerVeEtkinliklerScreen from "../screens/HaberlerVeEtkinliklerScreen";
import HavaDurumuDetayScreen from "../screens/HavaDurumuDetayScreen";
import HavaKalitesiDetayScreen from "../screens/HavaKalitesiDetayScreen";
import MeclisKararlariScreen from "../screens/MeclisKararlariScreen";

const AnnouncementsStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    AnnouncementsMain: AnnouncementsScreen,
    HaberlerVeEtkinlikler: HaberlerVeEtkinliklerScreen,
    MeclisKararlari: MeclisKararlariScreen,
    HavaDurumuDetay: HavaDurumuDetayScreen,
    HavaKalitesiDetay: HavaKalitesiDetayScreen,
  },
});

export default AnnouncementsStack;
