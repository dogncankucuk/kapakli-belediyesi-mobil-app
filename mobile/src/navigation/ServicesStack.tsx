import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ServicesScreen from "../screens/ServicesScreen";

// Hizmet detay ekranlari artik RootStack'te (birden fazla sekmeden
// erisilebildikleri icin) - bkz. navigation/RootStack.tsx.
const ServicesStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    ServicesMain: ServicesScreen,
  },
});

export default ServicesStack;
