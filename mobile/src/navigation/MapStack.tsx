import { createNativeStackNavigator } from "@react-navigation/native-stack";

import KentLokantasiScreen from "../screens/KentLokantasiScreen";
import MapScreen from "../screens/MapScreen";
import NobetciEczanelerScreen from "../screens/NobetciEczanelerScreen";
import OtobusTakipScreen from "../screens/OtobusTakipScreen";
import SehirKameralariScreen from "../screens/SehirKameralariScreen";
import UlasimHizmetleriScreen from "../screens/UlasimHizmetleriScreen";
import WifiNoktalariScreen from "../screens/WifiNoktalariScreen";

const MapStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    MapMain: MapScreen,
    UlasimHizmetleri: UlasimHizmetleriScreen,
    OtobusTakip: OtobusTakipScreen,
    NobetciEczaneler: NobetciEczanelerScreen,
    WifiNoktalari: WifiNoktalariScreen,
    SehirKameralari: SehirKameralariScreen,
    KentLokantasi: KentLokantasiScreen,
  },
});

export default MapStack;
