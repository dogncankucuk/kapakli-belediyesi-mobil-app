import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HavaScreen from "../screens/HavaScreen";

const HavaStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    HavaMain: HavaScreen,
  },
});

export default HavaStack;
