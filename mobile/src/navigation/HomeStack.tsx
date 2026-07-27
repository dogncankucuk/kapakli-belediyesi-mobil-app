import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import ProjelerimizScreen from "../screens/ProjelerimizScreen";

const HomeStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    HomeMain: HomeScreen,
    Projelerimiz: ProjelerimizScreen,
  },
});

export default HomeStack;
