import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LocaleProvider } from "./src/i18n/LocaleContext";
import Navigation from "./src/navigation";
import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";

function ThemedStatusBar() {
  const { mode } = useTheme();
  return <StatusBar style={mode === "dark" ? "light" : "dark"} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocaleProvider>
          <Navigation />
          <ThemedStatusBar />
        </LocaleProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
