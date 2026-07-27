import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, type WebViewNavigation } from "react-native-webview";

import { useTranslation } from "../i18n/LocaleContext";
import { Colors, spacing, typography, useThemeColors } from "../theme";

// Belediyenin kendi nobetci eczane sayfasi zaten sadece Kapakli'yi
// listeliyor (ilce filtresi gerekmiyor), ama telefon numaralari duz metin
// <td> hucreleri - tiklanabilir degil. Numaralari kendimiz <a href="tel:...">
// linkine ceviriyoruz ki alttaki onShouldStartLoadWithRequest yakalayip
// isletim sisteminin arama ekranina yonlendirebilsin.
// Tablo (Tarih/Eczane/Telefon/Adres/Yol Tarifi) genis masaustu duzeninde -
// dar ekranda yatay kaydirma gerektiriyordu. thead/tbody yapisini kullanip
// her hucreye kendi sutun basligini data-label olarak veriyoruz, sonra CSS
// ile satirlari dikey kart gorunumune ceviriyoruz (klasik "responsive
// table" tekniği).
const LINKIFY_PHONES_JS = `
(function () {
  function dismissCookieBanner() {
    var close = document.querySelector('.cookie-close');
    if (close) close.click();
  }
  function makeTableResponsive() {
    var table = document.querySelector('table');
    if (!table || table.dataset.kapakliResponsive) return;
    var headerCells = table.querySelectorAll('thead th');
    if (!headerCells.length) return;
    var headers = Array.prototype.map.call(headerCells, function (h) { return h.textContent.trim(); });
    var rows = table.querySelectorAll('tbody tr');
    for (var r = 0; r < rows.length; r += 1) {
      var cells = rows[r].querySelectorAll('td, th');
      for (var c = 0; c < cells.length && c < headers.length; c += 1) {
        cells[c].setAttribute('data-label', headers[c]);
      }
    }
    table.dataset.kapakliResponsive = '1';
    var style = document.createElement('style');
    style.textContent =
      '@media (max-width: 700px) {' +
      'table thead { display: none !important; }' +
      'table, table tbody, table tr, table td, table th { width: auto !important; }' +
      'table tr { display: block !important; margin-bottom: 14px !important; border: 1px solid #ddd !important; border-radius: 8px !important; }' +
      'table td, table th { display: block !important; text-align: left !important; border: none !important; border-bottom: 1px solid #eee !important; padding: 6px 10px !important; white-space: normal !important; }' +
      'table td:before, table th:before { content: attr(data-label); font-weight: bold; display: block; font-size: 12px; color: #888; }' +
      '}';
    document.head.appendChild(style);
  }
  function linkifyPhones() {
    var cells = document.querySelectorAll('td');
    for (var i = 0; i < cells.length; i += 1) {
      var cell = cells[i];
      var text = (cell.textContent || '').trim();
      var digits = text.replace(/\\s/g, '');
      if (cell.dataset.kapakliLinked || !/^0\\d{10}$/.test(digits)) continue;
      cell.dataset.kapakliLinked = '1';
      var link = document.createElement('a');
      link.href = 'tel:' + digits;
      link.textContent = text;
      cell.textContent = '';
      cell.appendChild(link);
    }
  }
  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    dismissCookieBanner();
    makeTableResponsive();
    linkifyPhones();
    if (tries > 20) clearInterval(timer);
  }, 250);
  true;
})();
true;
`;

// Sitedeki telefon numaralari duzgun bir sekilde <a href="tel:..."> olarak
// isaretlenmis, ama WebView bu tel: navigasyonunu kendi icinde acamadigi
// icin sessizce yutuyor - isletim sisteminin arama ekranina yonlendirmek
// icin burada yakalayip Linking ile aciyoruz.
function handleShouldStartLoad(request: WebViewNavigation) {
  if (request.url.startsWith("tel:") || request.url.startsWith("mailto:")) {
    Linking.openURL(request.url);
    return false;
  }
  return true;
}

export default function NobetciEczanelerScreen() {
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
        <Text style={styles.headerTitle}>{t("nobetciEczaneler_title")}</Text>
      </View>

      <WebView
        source={{ uri: "https://www.kapakli.bel.tr/kapakli-nobetci-eczaneler" }}
        injectedJavaScript={LINKIFY_PHONES_JS}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
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
