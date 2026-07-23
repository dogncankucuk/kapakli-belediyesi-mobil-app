import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EngelliYasliHizmetleriScreen from "../screens/EngelliYasliHizmetleriScreen";
import FaturaOdemeScreen from "../screens/FaturaOdemeScreen";
import FormlarVeDilekcelerScreen from "../screens/FormlarVeDilekcelerScreen";
import RandevuAlScreen from "../screens/RandevuAlScreen";
import ServicesScreen from "../screens/ServicesScreen";
import SuHizmetleriScreen from "../screens/SuHizmetleriScreen";
import TaleplerimScreen from "../screens/TaleplerimScreen";
import YeniTalepOlusturScreen from "../screens/YeniTalepOlusturScreen";

const ServicesStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    ServicesMain: ServicesScreen,
    FaturaOdeme: FaturaOdemeScreen,
    SuHizmetleri: SuHizmetleriScreen,
    RandevuAl: RandevuAlScreen,
    YeniTalepOlustur: YeniTalepOlusturScreen,
    Taleplerim: TaleplerimScreen,
    FormlarVeDilekceler: FormlarVeDilekcelerScreen,
    EngelliYasliHizmetleri: EngelliYasliHizmetleriScreen,
  },
});

export default ServicesStack;
