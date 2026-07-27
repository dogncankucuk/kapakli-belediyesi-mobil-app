import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { useTranslation } from "../i18n/LocaleContext";
import { Colors, spacing, typography, useThemeColors } from "../theme";

// Tekulaş'ın arama kutusu sadece bir oneri (autocomplete) acar, ana hat
// listesini kendiliginden filtrelemez - bu yuzden "Kapakli" ile eslesmeyen
// .tekulas-line kartlarini kendimiz gizliyoruz (sitenin kendi filtre
// mantigina guvenmek yerine dogrudan DOM uzerinde).
const FILTER_KAPAKLI_JS = `
(function () {
  function applyFilter() {
    var input = document.getElementById('tekulas-line-search');
    var lines = document.querySelectorAll('.tekulas-line');
    if (!input || !lines.length) return false;
    var setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    ).set;
    setter.call(input, 'Kapaklı');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    lines.forEach(function (el) {
      var titleEl = el.querySelector('.line-title');
      var title = (titleEl ? titleEl.innerText : '').toLocaleUpperCase('tr');
      if (title.indexOf('KAPAKLI') !== -1 || title.indexOf('KAPAKLİ') !== -1) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });
    return true;
  }
  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    if (applyFilter() || tries > 20) clearInterval(timer);
  }, 250);
  true;
})();
true;
`;

export default function OtobusTakipScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("common_back")}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("otobusTakip_title")}</Text>
      </View>

      <WebView
        source={{ uri: "https://www.tekulas.com.tr/ulasim/" }}
        injectedJavaScript={FILTER_KAPAKLI_JS}
        style={styles.webview}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
      paddingHorizontal: spacing.containerMargin,
      paddingVertical: spacing.stackGap,
      backgroundColor: colors.primaryContainer,
    },
    backButton: {
      width: spacing.touchTargetMin,
      height: spacing.touchTargetMin,
      marginLeft: -spacing.stackGap,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      ...typography.titleLg,
      color: colors.onPrimary,
    },
    webview: {
      flex: 1,
    },
  });
