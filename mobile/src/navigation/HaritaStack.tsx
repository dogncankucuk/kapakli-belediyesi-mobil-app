import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MapScreen from "../screens/MapScreen";

const HaritaStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    HaritaMain: MapScreen,
  },
});

export default HaritaStack;
