import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HesapBilgilerimScreen from "../screens/HesapBilgilerimScreen";
import ProfileScreen from "../screens/ProfileScreen";
import VefatEdenlerScreen from "../screens/VefatEdenlerScreen";

// Ayarlar, Hakkimizda, Baskan, BizeUlasin, YardimMerkezi artik RootStack'te
// (birden fazla sekmeden erisilebildikleri icin) - bkz. navigation/RootStack.tsx.
const ProfileStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    ProfileMain: ProfileScreen,
    HesapBilgilerim: HesapBilgilerimScreen,
    VefatEdenler: VefatEdenlerScreen,
  },
});

export default ProfileStack;
