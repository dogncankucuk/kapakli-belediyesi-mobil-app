import { MaterialIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView, { WebViewMessageEvent } from "react-native-webview";

import { getCamiler } from "../api/camiler";
import { getOnemliKurumlar } from "../api/onemliKurumlar";
import { getParklar } from "../api/parklar";
import { getPharmacies } from "../api/pharmacies";
import { getTarihiYerler } from "../api/tarihiYerler";
import { getWifiNoktalari } from "../api/wifiNoktalari";
import { Card, TopBar } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { TranslationKey } from "../i18n/tr";
import { useAppShell } from "../navigation/AppShellContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

type LayerKey =
  "parklar" | "tarihiYerler" | "eczaneler" | "wifi" | "camiler" | "kurumlar";

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

type Poi = {
  id: string;
  layer: LayerKey;
  name: string;
  address: string;
  subtitle: string;
  lat: number;
  lng: number;
};

const LAYER_OPTIONS: { labelKey: TranslationKey; value: LayerKey }[] = [
  { labelKey: "map_parklar", value: "parklar" },
  { labelKey: "map_tarihiYerler", value: "tarihiYerler" },
  { labelKey: "map_eczaneler", value: "eczaneler" },
  { labelKey: "map_wifi", value: "wifi" },
  { labelKey: "map_camiler", value: "camiler" },
  { labelKey: "map_kurumlar", value: "kurumlar" },
];

const LAYER_COLORS: Record<LayerKey, string> = {
  parklar: "#2E8B57",
  tarihiYerler: "#8B5E34",
  eczaneler: "#EF353A",
  wifi: "#1E88E5",
  camiler: "#00897B",
  kurumlar: "#5E35B1",
};

const LAYER_ICONS: Record<LayerKey, keyof typeof MaterialIcons.glyphMap> = {
  parklar: "park",
  tarihiYerler: "account-balance",
  eczaneler: "local-pharmacy",
  wifi: "wifi",
  camiler: "mosque",
  kurumlar: "domain",
};

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
  }));

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
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
    var layerGroups = {};

    markers.forEach(function (marker) {
      var circle = L.circleMarker([marker.lat, marker.lng], {
        radius: 10,
        color: '#FFFFFF',
        weight: 2,
        fillColor: marker.color,
        fillOpacity: 1,
      });
      circle.on('click', function () {
        window.ReactNativeWebView.postMessage(JSON.stringify(marker));
      });
      if (!layerGroups[marker.layer]) {
        layerGroups[marker.layer] = L.layerGroup();
      }
      circle.addTo(layerGroups[marker.layer]);
    });

    var activeLayer = null;
    function setLayer(key) {
      if (activeLayer) {
        map.removeLayer(activeLayer);
      }
      activeLayer = layerGroups[key];
      if (activeLayer) {
        activeLayer.addTo(map);
      }
    }
    setLayer('parklar');
  </script>
</body>
</html>`;
}

export default function MapScreen() {
  const { openMenu } = useAppShell();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const route = useRoute();
  const initialTab = (route.params as { initialTab?: TabKey } | undefined)
    ?.initialTab;
  const webViewRef = useRef<WebView>(null);
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab ?? "parklar");
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [apiPois, setApiPois] = useState<Poi[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      getPharmacies(),
      getWifiNoktalari(),
      getCamiler(),
      getOnemliKurumlar(),
      getParklar(),
      getTarihiYerler(),
    ]).then(
      ([
        pharmacies,
        wifiNoktalari,
        camiler,
        onemliKurumlar,
        parklar,
        tarihiYerler,
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

  const handleTabChange = (value: TabKey) => {
    setActiveTab(value);
    setSelectedPoi(null);
    if (value !== "kentRehberi") {
      webViewRef.current?.injectJavaScript(`setLayer('${value}'); true;`);
    }
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
      <TopBar title={t("tabs_map")} onMenuPress={openMenu} />
      <View style={styles.tabWrapper}>
        {LAYER_OPTIONS.map((option) => {
          const isActive = option.value === activeTab;
          const label = t(option.labelKey);
          return (
            <Pressable
              key={option.value}
              onPress={() => handleTabChange(option.value)}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: isActive }}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <MaterialIcons
                name={LAYER_ICONS[option.value]}
                size={20}
                color={isActive ? colors.onPrimary : colors.onBackground}
              />
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={() => handleTabChange("kentRehberi")}
          accessibilityRole="button"
          accessibilityLabel={t("map_kentRehberi")}
          accessibilityState={{ selected: activeTab === "kentRehberi" }}
          style={[styles.tab, activeTab === "kentRehberi" && styles.tabActive]}
        >
          <MaterialIcons
            name="public"
            size={20}
            color={
              activeTab === "kentRehberi"
                ? colors.onPrimary
                : colors.onBackground
            }
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === "kentRehberi" && styles.tabLabelActive,
            ]}
            numberOfLines={1}
          >
            {t("map_kentRehberi")}
          </Text>
        </Pressable>
      </View>
      <View style={styles.mapWrapper}>
        {activeTab === "kentRehberi" ? (
          <WebView
            source={{ uri: KENT_REHBERI_URL }}
            style={styles.map}
            injectedJavaScriptBeforeContentLoaded={HIDE_KENT_REHBERI_CHROME_JS}
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html }}
            style={styles.map}
            onMessage={handleMessage}
          />
        )}
        {isLoading && activeTab !== "kentRehberi" ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.primaryContainer} />
          </View>
        ) : null}
        {selectedPoi ? (
          <Card style={styles.detailCard}>
            <View style={styles.detailRow}>
              <View
                style={[
                  styles.detailIcon,
                  { backgroundColor: LAYER_COLORS[selectedPoi.layer] },
                ]}
              >
                <MaterialIcons
                  name={LAYER_ICONS[selectedPoi.layer]}
                  size={20}
                  color={colors.onPrimary}
                />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailName} numberOfLines={1}>
                  {selectedPoi.name}
                </Text>
                <Text style={styles.detailAddress} numberOfLines={1}>
                  {selectedPoi.address}
                </Text>
                <Text style={styles.detailHours}>{selectedPoi.subtitle}</Text>
              </View>
              <Pressable
                onPress={() => setSelectedPoi(null)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t("map_close")}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={20} color={colors.outline} />
              </Pressable>
            </View>
          </Card>
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
    tabWrapper: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: spacing.containerMargin,
      paddingVertical: spacing.stackGap,
    },
    tab: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      minHeight: spacing.touchTargetMin - 8,
      borderRadius: shape.roundedLg,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      paddingHorizontal: spacing.stackGap,
      backgroundColor: colors.surfaceContainerLowest,
    },
    tabActive: {
      backgroundColor: colors.primaryContainer,
      borderColor: colors.primaryContainer,
    },
    tabLabel: {
      ...typography.labelSm,
      color: colors.onBackground,
    },
    tabLabelActive: {
      color: colors.onPrimary,
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
    detailCard: {
      position: "absolute",
      left: spacing.containerMargin,
      right: spacing.containerMargin,
      bottom: spacing.containerMargin,
      padding: spacing.stackGap,
    },
    detailRow: {
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
