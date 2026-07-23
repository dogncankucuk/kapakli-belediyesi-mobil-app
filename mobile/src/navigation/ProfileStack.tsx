import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AyarlarScreen from "../screens/AyarlarScreen";
import BizeUlasinScreen from "../screens/BizeUlasinScreen";
import HakkimizdaScreen from "../screens/HakkimizdaScreen";
import HesapBilgilerimScreen from "../screens/HesapBilgilerimScreen";
import ProfileScreen from "../screens/ProfileScreen";
import VefatEdenlerScreen from "../screens/VefatEdenlerScreen";
import YardimMerkeziScreen from "../screens/YardimMerkeziScreen";

const ProfileStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    ProfileMain: ProfileScreen,
    Ayarlar: AyarlarScreen,
    HesapBilgilerim: HesapBilgilerimScreen,
    Hakkimizda: HakkimizdaScreen,
    BizeUlasin: BizeUlasinScreen,
    VefatEdenler: VefatEdenlerScreen,
    YardimMerkezi: YardimMerkeziScreen,
  },
});

export default ProfileStack;
