import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Linking,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView, { WebViewMessageEvent } from "react-native-webview";

import { getAtikNoktalari } from "../api/atikNoktalari";
import { getCamiler } from "../api/camiler";
import { getOnemliKurumlar } from "../api/onemliKurumlar";
import { getParklar } from "../api/parklar";
import { getPharmacies } from "../api/pharmacies";
import { getTarihiYerler } from "../api/tarihiYerler";
import { getWifiNoktalari } from "../api/wifiNoktalari";
import { Card, TopBar } from "../components";
import { ATIK_TURLERI } from "../constants/atikTurleri";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

type LayerKey =
  | "parklar"
  | "tarihiYerler"
  | "eczaneler"
  | "wifi"
  | "camiler"
  | "kurumlar"
  | "atikNoktalari";

type TabKey = LayerKey | "kentRehberi";

const KENT_REHBERI_URL =
  "https://cbs.kapakli.bel.tr/GiSoftGis/#/cityguidepublic";

// GiSoftGis kendi ust arac cubugunu (.cityguide-header) haritanin (#map)
// UZERINE position:absolute ile bindiriyor - gizlemek haritanin boyutunu
// etkilemiyor. Katman secimi (Numarataj/Parsel/Onemli Yerler/Wifi Noktalari
// vb.) icin native bir kopru denendi ama guvenilir dogrulanamadigi icin
// vazgecildi - kullanicilar katman secimini sitenin kendi calisan katman
// panelinden (sag-ust "layer-panel-button") yapabiliyor, o buton bilerek
// gizlenmedi.
const HIDE_KENT_REHBERI_CHROME_JS = `
(function () {
  var style = document.createElement('style');
  style.innerHTML = '.cityguide-header { display: none !important; }';
  document.documentElement.appendChild(style);
})();
true;
`;

// GiSoftGis'in kendisi hicbir altlik (base) katmani varsayilan secili
// getirmiyor - kullanici Katmanlar panelini acip "Standart Harita" gibi bir
// secenegi elle isaretlemeden harita bombos (sadece sinir/overlay
// vektorleri) goruniyor. _gilayerswitcher-tpl.html'de temel katmanlar gercek
// <input type="radio" name="baseMapLayerOption" ng-click="toggleBaseMapLayer(...)">
// elemanlari - panel gorsel olarak kapali olsa da DOM'da mevcutlar, o yuzden
// paneli acmadan dogrudan bu radio'ya native bir click event'i dispatch
// etmek Angular'in kendi secim akisini tetikliyor. Sayfa/Angular render'i
// asenkron oldugundan element gelene kadar kisa araliklarla deneniyor.
const SELECT_DEFAULT_BASE_LAYER_JS = `
(function () {
  function selectDefaultBaseLayer() {
    var labels = document.querySelectorAll('.layer-name');
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].textContent.trim() === 'Standart Harita') {
        var container = labels[i].closest('li') || labels[i].parentElement;
        var radio = container
          ? container.querySelector('input[type="radio"][name="baseMapLayerOption"]')
          : null;
        if (radio && !radio.checked) {
          radio.click();
        }
        return !!radio;
      }
    }
    return false;
  }
  var attempts = 0;
  var poll = setInterval(function () {
    attempts += 1;
    if (selectDefaultBaseLayer() || attempts > 40) {
      clearInterval(poll);
    }
  }, 500);
})();
true;
`;

type Poi = {
  id: string;
  layer: LayerKey;
  name: string;
  address: string;
  subtitle: string;
  lat: number;
  lng: number;
};

function openInGoogleMaps(poi: Poi) {
  Linking.openURL(
    `https://www.google.com/maps/search/?api=1&query=${poi.lat},${poi.lng}`,
  );
}

const LAYER_OPTIONS: { labelKey: TranslationKey; value: LayerKey }[] = [
  { labelKey: "map_parklar", value: "parklar" },
  { labelKey: "map_tarihiYerler", value: "tarihiYerler" },
  { labelKey: "map_eczaneler", value: "eczaneler" },
  { labelKey: "map_wifi", value: "wifi" },
  { labelKey: "map_camiler", value: "camiler" },
  { labelKey: "map_kurumlar", value: "kurumlar" },
  { labelKey: "map_atikNoktalari", value: "atikNoktalari" },
];

const LAYER_COLORS: Record<LayerKey, string> = {
  parklar: "#2E8B57",
  tarihiYerler: "#8B5E34",
  eczaneler: "#EF353A",
  wifi: "#1E88E5",
  camiler: "#00897B",
  kurumlar: "#5E35B1",
  atikNoktalari: "#EF6C00",
};

const LAYER_ICONS: Record<LayerKey, keyof typeof MaterialIcons.glyphMap> = {
  parklar: "park",
  tarihiYerler: "account-balance",
  eczaneler: "local-pharmacy",
  wifi: "wifi",
  camiler: "mosque",
  kurumlar: "domain",
  atikNoktalari: "recycling",
};

// WebView haritasindaki pin rozetleri icin - MaterialIcons font'u WebView'e
// gomulu olmadigindan emoji kullanildi, native tarafta (detay karti,
// sekmeler) MaterialIcons kullanilmaya devam ediyor.
const LAYER_EMOJI: Record<LayerKey, string> = {
  parklar: "🌳",
  tarihiYerler: "🏛️",
  eczaneler: "💊",
  wifi: "📶",
  camiler: "🕌",
  kurumlar: "🏢",
  atikNoktalari: "♻️",
};

type PillStyles = {
  tab: StyleProp<ViewStyle>;
  tabLabel: StyleProp<TextStyle>;
};

function LayerPill({
  label,
  isActive,
  onPress,
  colors,
  styles,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  colors: Colors;
  styles: PillStyles;
}) {
  const [focus] = useState(() => new Animated.Value(isActive ? 1 : 0));
  const [scale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    Animated.timing(focus, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isActive, focus]);

  const backgroundColor = focus.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceContainerLowest, colors.primaryContainer],
  });
  const borderColor = focus.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.outlineVariant, colors.primaryContainer],
  });
  const textColor = focus.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.onBackground, colors.onPrimary],
  });

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      // Ayni Animated.View'in stilinde focus (renk interpolasyonu, native
      // driver desteklemiyor) ile birlikte kullanildigindan bu da JS-driven
      // kalmali - aksi halde "animated node moved to native" render hatasi
      // veriyor (ayni node'un bir kismi native, bir kismi JS-driven olamaz).
      useNativeDriver: false,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: false,
      speed: 30,
      bounciness: 9,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View
        style={[
          styles.tab,
          { backgroundColor, borderColor, transform: [{ scale }] },
        ]}
      >
        <Animated.Text
          style={[styles.tabLabel, { color: textColor }]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

function buildLeafletHtml(pois: Poi[]): string {
  const markers = pois.map((poi) => ({
    id: poi.id,
    layer: poi.layer,
    name: poi.name,
    address: poi.address,
    subtitle: poi.subtitle,
    lat: poi.lat,
    lng: poi.lng,
    color: LAYER_COLORS[poi.layer],
    emoji: LAYER_EMOJI[poi.layer],
  }));

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .poi-pin { position: relative; width: 40px; height: 52px; }
    .poi-pin__badge {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--pin-color);
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      line-height: 1;
    }
    .poi-pin__tail {
      position: absolute;
      left: 50%;
      bottom: 4px;
      width: 12px;
      height: 12px;
      background: var(--pin-color);
      border-radius: 2px;
      transform: translateX(-50%) rotate(45deg);
      z-index: -1;
      box-shadow: 1px 1px 3px rgba(0,0,0,0.25);
    }
    @keyframes poi-pin-drop {
      0% { transform: translateY(-26px) scale(0.4); opacity: 0; }
      65% { transform: translateY(3px) scale(1.08); opacity: 1; }
      100% { transform: translateY(0) scale(1); opacity: 1; }
    }
    .poi-pin {
      animation-name: poi-pin-drop;
      animation-duration: 0.4s;
      animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
      animation-fill-mode: both;
    }
    .poi-pin:active .poi-pin__badge {
      transform: scale(0.9);
    }
    .poi-pin__badge {
      transition: transform 0.12s ease-out;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([41.33, 27.975], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    var markers = ${JSON.stringify(markers)};
    var byLayer = {};
    markers.forEach(function (marker) {
      (byLayer[marker.layer] = byLayer[marker.layer] || []).push(marker);
    });

    var layerGroups = {};
    Object.keys(byLayer).forEach(function (layerKey) {
      layerGroups[layerKey] = byLayer[layerKey].map(function (marker, index) {
        var delayMs = Math.min(index * 25, 400);
        var icon = L.divIcon({
          className: '',
          html:
            '<div class="poi-pin" style="--pin-color: ' + marker.color +
            '; animation-delay: ' + delayMs + 'ms">' +
            '<div class="poi-pin__badge">' + marker.emoji + '</div>' +
            '<div class="poi-pin__tail"></div>' +
            '</div>',
          iconSize: [40, 52],
          iconAnchor: [20, 48],
        });
        var pin = L.marker([marker.lat, marker.lng], { icon: icon });
        pin._subtitle = marker.subtitle;
        pin.on('click', function () {
          window.ReactNativeWebView.postMessage(JSON.stringify(marker));
        });
        return pin;
      });
    });

    var activeLayer = null;
    function setLayer(key, subFilter) {
      if (activeLayer) {
        map.removeLayer(activeLayer);
      }
      var pins = layerGroups[key];
      if (pins && subFilter) {
        pins = pins.filter(function (pin) {
          return pin._subtitle === subFilter;
        });
      }
      activeLayer = pins ? L.layerGroup(pins) : null;
      if (activeLayer) {
        activeLayer.addTo(map);
      }
    }
    function panTo(lat, lng) {
      map.setView([lat, lng], 17);
    }
  </script>
</body>
</html>`;
}

export default function MapScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const route = useRoute();
  const routeParams = route.params as
    { initialTab?: TabKey; focusId?: string } | undefined;
  const initialTab = routeParams?.initialTab;
  const focusId = routeParams?.focusId;
  const webViewRef = useRef<WebView>(null);
  const hasFocusedRef = useRef(false);
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab ?? "parklar");
  // "Atık Noktaları" katmani icin alt kategori filtresi (Cam/Plastik/Kağıt
  // vb.) - null = tumu goster. Sadece bu katman aktifken anlamli.
  const [atikSubFilter, setAtikSubFilter] = useState<string | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [renderedPoi, setRenderedPoi] = useState<Poi | null>(null);
  const [apiPois, setApiPois] = useState<Poi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cardAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Promise.resolve().then(() => {
      if (selectedPoi) {
        setRenderedPoi(selectedPoi);
      }
    });
    if (selectedPoi) {
      Animated.spring(cardAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 16,
        bounciness: 6,
      }).start();
    } else {
      Animated.timing(cardAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setRenderedPoi(null);
      });
    }
  }, [selectedPoi, cardAnim]);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      getPharmacies(),
      getWifiNoktalari(),
      getCamiler(),
      getOnemliKurumlar(),
      getParklar(),
      getTarihiYerler(),
      getAtikNoktalari(),
    ]).then(
      ([
        pharmacies,
        wifiNoktalari,
        camiler,
        onemliKurumlar,
        parklar,
        tarihiYerler,
        atikNoktalari,
      ]) => {
        if (cancelled) return;

        const pois: Poi[] = [];

        if (pharmacies.status === "fulfilled") {
          pois.push(
            ...pharmacies.value.map((item) => ({
              id: `eczane-${item.id}`,
              layer: "eczaneler" as const,
              name: item.ad,
              address: item.adres,
              subtitle: item.telefon,
              lat: item.lat,
              lng: item.lng,
            })),
          );
        }

        if (wifiNoktalari.status === "fulfilled") {
          pois.push(
            ...wifiNoktalari.value.map((item) => ({
              id: `wifi-${item.id}`,
              layer: "wifi" as const,
              name: item.ad,
              address: item.adres,
              subtitle: `Ücretsiz Wi-Fi - ${item.kategori}`,
              lat: item.lat,
              lng: item.lng,
            })),
          );
        }

        if (camiler.status === "fulfilled") {
          pois.push(
            ...camiler.value.map((item) => ({
              id: `cami-${item.id}`,
              layer: "camiler" as const,
              name: item.ad,
              address: item.adres ?? "",
              subtitle: "Namaz vakitlerinde açık",
              lat: item.lat,
              lng: item.lng,
            })),
          );
        }

        if (onemliKurumlar.status === "fulfilled") {
          pois.push(
            ...onemliKurumlar.value.map((item) => ({
              id: `kurum-${item.id}`,
              layer: "kurumlar" as const,
              name: item.ad,
              address: item.adres ?? "",
              subtitle: item.tur,
              lat: item.lat,
              lng: item.lng,
            })),
          );
        }

        if (parklar.status === "fulfilled") {
          pois.push(
            ...parklar.value.map((item) => ({
              id: `park-${item.id}`,
              layer: "parklar" as const,
              name: item.ad,
              address: item.adres ?? "",
              subtitle: item.tur,
              lat: item.lat,
              lng: item.lng,
            })),
          );
        }

        if (tarihiYerler.status === "fulfilled") {
          pois.push(
            ...tarihiYerler.value.map((item) => ({
              id: `tarihi-${item.id}`,
              layer: "tarihiYerler" as const,
              name: item.ad,
              address: item.adres ?? "",
              subtitle: item.tur,
              lat: item.lat,
              lng: item.lng,
            })),
          );
        }

        if (atikNoktalari.status === "fulfilled") {
          pois.push(
            ...atikNoktalari.value.map((item) => ({
              id: `atik-${item.id}`,
              layer: "atikNoktalari" as const,
              name: item.ad,
              address: item.adres ?? "",
              subtitle: item.tur,
              lat: item.lat,
              lng: item.lng,
            })),
          );
        }

        setApiPois(pois);
        setIsLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const allPois = useMemo(() => apiPois, [apiPois]);
  const html = useMemo(() => buildLeafletHtml(allPois), [allPois]);

  // Bir liste ekranindan (ör. Atik Noktalari) "haritada gor" ile gelindiginde
  // route.params.focusId ile belirtilen noktayi bulup haritayi ona
  // odakliyor ve detay kartini otomatik aciyor - sadece bir kez, veri
  // yuklendikten sonra tetiklenir.
  const focusTarget = useMemo(
    () => (focusId ? (allPois.find((p) => p.id === focusId) ?? null) : null),
    [allPois, focusId],
  );

  useEffect(() => {
    if (focusTarget && !hasFocusedRef.current) {
      hasFocusedRef.current = true;
      setActiveTab(focusTarget.layer);
      setSelectedPoi(focusTarget);
    }
  }, [focusTarget]);

  const handleTabChange = (value: TabKey) => {
    setActiveTab(value);
    setAtikSubFilter(null);
    setSelectedPoi(null);
    if (value !== "kentRehberi") {
      webViewRef.current?.injectJavaScript(`setLayer('${value}'); true;`);
    }
  };

  const handleAtikSubFilterChange = (value: string | null) => {
    setAtikSubFilter(value);
    setSelectedPoi(null);
    webViewRef.current?.injectJavaScript(
      `setLayer('atikNoktalari', ${value ? JSON.stringify(value) : "null"}); true;`,
    );
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    const data = JSON.parse(event.nativeEvent.data) as {
      id: string;
      layer: LayerKey;
    };
    const poi = allPois.find((item) => item.id === data.id) ?? null;
    setSelectedPoi(poi);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar title={t("tabs_map")} onBackPress={() => navigation.goBack()} />
      <Text style={styles.heading}>{t("map_heading")}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabWrapper}
      >
        {LAYER_OPTIONS.map((option) => (
          <LayerPill
            key={option.value}
            label={t(option.labelKey)}
            isActive={option.value === activeTab}
            onPress={() => handleTabChange(option.value)}
            colors={colors}
            styles={styles}
          />
        ))}
        <LayerPill
          label={t("map_kentRehberi")}
          isActive={activeTab === "kentRehberi"}
          onPress={() => handleTabChange("kentRehberi")}
          colors={colors}
          styles={styles}
        />
      </ScrollView>
      {activeTab === "atikNoktalari" ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subFilterScroll}
          contentContainerStyle={styles.subFilterWrapper}
        >
          <LayerPill
            label={t("atik_filterAll")}
            isActive={atikSubFilter === null}
            onPress={() => handleAtikSubFilterChange(null)}
            colors={colors}
            styles={styles}
          />
          {ATIK_TURLERI.map((tur) => (
            <LayerPill
              key={tur}
              label={tur}
              isActive={atikSubFilter === tur}
              onPress={() => handleAtikSubFilterChange(tur)}
              colors={colors}
              styles={styles}
            />
          ))}
        </ScrollView>
      ) : null}
      <View style={styles.mapWrapper}>
        {activeTab === "kentRehberi" ? (
          <WebView
            source={{ uri: KENT_REHBERI_URL }}
            style={styles.map}
            injectedJavaScriptBeforeContentLoaded={HIDE_KENT_REHBERI_CHROME_JS}
            injectedJavaScript={SELECT_DEFAULT_BASE_LAYER_JS}
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html }}
            style={styles.map}
            onMessage={handleMessage}
            onLoadEnd={() => {
              const subFilterArg =
                activeTab === "atikNoktalari" && atikSubFilter
                  ? `, ${JSON.stringify(atikSubFilter)}`
                  : "";
              webViewRef.current?.injectJavaScript(
                `setLayer('${activeTab}'${subFilterArg}); true;`,
              );
              if (focusTarget) {
                webViewRef.current?.injectJavaScript(
                  `if (typeof panTo === 'function') { panTo(${focusTarget.lat}, ${focusTarget.lng}); } true;`,
                );
              }
            }}
          />
        )}
        {isLoading && activeTab !== "kentRehberi" ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.primaryContainer} />
          </View>
        ) : null}
        {renderedPoi ? (
          <Animated.View
            style={[
              styles.detailCardWrapper,
              {
                opacity: cardAnim,
                transform: [
                  {
                    translateY: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Card style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Pressable
                  onPress={() => openInGoogleMaps(renderedPoi)}
                  accessibilityRole="button"
                  accessibilityLabel={t("map_openInGoogleMaps")}
                  style={styles.detailPressable}
                >
                  <View
                    style={[
                      styles.detailIcon,
                      { backgroundColor: LAYER_COLORS[renderedPoi.layer] },
                    ]}
                  >
                    <MaterialIcons
                      name={LAYER_ICONS[renderedPoi.layer]}
                      size={20}
                      color={colors.onPrimary}
                    />
                  </View>
                  <View style={styles.detailText}>
                    <Text style={styles.detailName} numberOfLines={1}>
                      {renderedPoi.name}
                    </Text>
                    <Text style={styles.detailAddress} numberOfLines={1}>
                      {renderedPoi.address}
                    </Text>
                    <Text style={styles.detailHours}>
                      {renderedPoi.subtitle}
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedPoi(null)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t("map_close")}
                  style={styles.closeButton}
                >
                  <MaterialIcons
                    name="close"
                    size={20}
                    color={colors.outline}
                  />
                </Pressable>
              </View>
            </Card>
          </Animated.View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    heading: {
      ...typography.titleLg,
      color: colors.onBackground,
      paddingHorizontal: spacing.containerMargin,
      paddingTop: spacing.stackGap,
    },
    tabScroll: {
      flexGrow: 0,
    },
    tabWrapper: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: spacing.containerMargin,
      paddingVertical: spacing.stackGap,
    },
    subFilterScroll: {
      flexGrow: 0,
    },
    subFilterWrapper: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: spacing.containerMargin,
      paddingBottom: spacing.stackGap,
    },
    tab: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: spacing.touchTargetMin,
      borderRadius: 999,
      paddingHorizontal: spacing.stackGap + 6,
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    tabLabel: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    mapWrapper: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
    loadingOverlay: {
      position: "absolute",
      top: spacing.containerMargin,
      right: spacing.containerMargin,
    },
    detailCardWrapper: {
      position: "absolute",
      left: spacing.containerMargin,
      right: spacing.containerMargin,
      bottom: spacing.containerMargin,
    },
    detailCard: {
      padding: spacing.stackGap,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
    },
    detailPressable: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
    },
    detailIcon: {
      width: 36,
      height: 36,
      borderRadius: shape.rounded,
      alignItems: "center",
      justifyContent: "center",
    },
    detailText: {
      flex: 1,
      gap: 2,
    },
    detailName: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    detailAddress: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    detailHours: {
      ...typography.labelSm,
      color: colors.secondary,
    },
    closeButton: {
      width: spacing.touchTargetMin - 12,
      height: spacing.touchTargetMin - 12,
      alignItems: "center",
      justifyContent: "center",
    },
  });
