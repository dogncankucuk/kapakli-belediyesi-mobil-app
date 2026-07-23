import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";

const HomeStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    HomeMain: HomeScreen,
  },
});

export default HomeStack;
