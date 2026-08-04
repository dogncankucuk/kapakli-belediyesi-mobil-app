import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AnnouncementsScreen from "../screens/AnnouncementsScreen";
import GuncelIcerikScreen from "../screens/GuncelIcerikScreen";
import MeclisGundemleriScreen from "../screens/MeclisGundemleriScreen";

// Haberler ve Etkinlikler, Meclis Kararlari, Hava Durumu/Kalitesi Detay
// artik RootStack'te (birden fazla sekmeden erisilebildikleri icin) -
// bkz. navigation/RootStack.tsx.
const AnnouncementsStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    AnnouncementsMain: AnnouncementsScreen,
    GuncelIcerik: GuncelIcerikScreen,
    MeclisGundemleri: MeclisGundemleriScreen,
  },
});

export default AnnouncementsStack;
