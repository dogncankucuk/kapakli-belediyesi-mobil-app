import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MapScreen from "../screens/MapScreen";

// Harita alt ekranlari artik RootStack'te (birden fazla sekmeden
// erisilebildikleri icin) - bkz. navigation/RootStack.tsx.
const MapStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    MapMain: MapScreen,
  },
});

export default MapStack;
