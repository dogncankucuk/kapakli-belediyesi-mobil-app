import * as Location from "expo-location";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import WebView from "react-native-webview";

import Card from "./Card";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

export type LocationValue = {
  lat: number | null;
  lng: number | null;
  adres: string;
};

export const BOS_KONUM: LocationValue = { lat: null, lng: null, adres: "" };

type LocationPreviewCardProps = {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
};

const buildHtml = (lat: number, lng: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; }
    .leaflet-control-container { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false }).setView([${lat}, ${lng}], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.circleMarker([${lat}, ${lng}], { radius: 9, color: '#FFFFFF', weight: 3, fillColor: '#1F5C56', fillOpacity: 1 }).addTo(map);
  </script>
</body>
</html>
`;

// Nominatim (OpenStreetMap'in ucretsiz ters-geocoding servisi) - admin
// panelin KonumSecici.tsx'teki ayni yontem. Konum bulundugunda sadece bir
// kez cagriliyor, bu yuzden 1 istek/sn kullanim sinirinin cok altinda kalir.
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=tr`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string };
    return data.display_name ?? null;
  } catch {
    return null;
  }
}

// Adres alani GPS durumundan bagimsiz her zaman gosterilir/duzenlenebilir -
// konum izni verilmese ya da GPS basarisiz olsa bile kullanici adresi elle
// girebilsin diye (hangi talep kategorisi olursa olsun ayni bilesen).
export default function LocationPreviewCard({
  value,
  onChange,
}: LocationPreviewCardProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [status, setStatus] = useState<
    "loading" | "ready" | "denied" | "error"
  >("loading");
  const [adresYukleniyor, setAdresYukleniyor] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        if (!cancelled) setStatus("denied");
        return;
      }
      try {
        const position = await Location.getCurrentPositionAsync({});
        if (cancelled) return;
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        onChange({ lat, lng, adres: value.adres });
        setStatus("ready");
        setAdresYukleniyor(true);
        const adres = await reverseGeocode(lat, lng);
        if (!cancelled && adres) {
          onChange({ lat, lng, adres });
        }
        if (!cancelled) setAdresYukleniyor(false);
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Konum</Text>
        <Text style={styles.hint}>Otomatik GPS</Text>
      </View>
      <Card style={styles.mapCard}>
        {status === "ready" && value.lat != null && value.lng != null ? (
          <WebView
            source={{ html: buildHtml(value.lat, value.lng) }}
            style={styles.webview}
            scrollEnabled={false}
            pointerEvents="none"
          />
        ) : (
          <View style={styles.placeholder}>
            {status === "loading" ? (
              <ActivityIndicator color={colors.primaryContainer} />
            ) : (
              <Text style={styles.placeholderText}>
                {status === "denied"
                  ? "Konum izni verilmedi"
                  : "Konum alınamadı"}
              </Text>
            )}
          </View>
        )}
      </Card>
      {value.lat != null && value.lng != null && (
        <Text style={styles.coords}>
          {`${value.lat.toFixed(4)}°N · ${value.lng.toFixed(4)}°E`}
        </Text>
      )}
      <Text style={styles.adresLabel}>
        Adres {adresYukleniyor ? "(bulunuyor...)" : ""}
      </Text>
      <TextInput
        style={styles.adresInput}
        placeholder="Adres bulunamadı, elle girin"
        placeholderTextColor={colors.outline}
        value={value.adres}
        onChangeText={(adres) => onChange({ ...value, adres })}
        multiline
      />
      <Text style={styles.adresHint}>
        Konumun adresi yanlışsa veya boşsa düzeltebilir/girebilirsiniz.
      </Text>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.stackGap / 2,
    },
    label: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    hint: {
      ...typography.labelSm,
      color: colors.outline,
    },
    mapCard: {
      height: 140,
      borderRadius: shape.roundedLg,
      overflow: "hidden",
      padding: 0,
    },
    webview: {
      flex: 1,
      backgroundColor: "transparent",
    },
    placeholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    placeholderText: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    coords: {
      ...typography.labelSm,
      color: colors.outline,
      marginTop: 4,
    },
    adresLabel: {
      ...typography.labelSm,
      color: colors.outline,
      marginTop: spacing.stackGap / 2,
    },
    adresInput: {
      ...typography.bodyMd,
      color: colors.onBackground,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: shape.rounded,
      padding: spacing.stackGap / 2,
      marginTop: 4,
      minHeight: 44,
    },
    adresHint: {
      ...typography.labelSm,
      color: colors.outline,
      marginTop: 4,
    },
  });
