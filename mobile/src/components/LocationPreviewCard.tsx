import * as Location from "expo-location";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import WebView from "react-native-webview";

import Card from "./Card";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

export type LocationValue = { lat: number; lng: number } | null;

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

export default function LocationPreviewCard({
  value,
  onChange,
}: LocationPreviewCardProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [status, setStatus] = useState<
    "loading" | "ready" | "denied" | "error"
  >("loading");

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
        onChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStatus("ready");
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
        {status === "ready" && value ? (
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
      {value ? (
        <Text style={styles.coords}>
          {`${value.lat.toFixed(4)}°N · ${value.lng.toFixed(4)}°E`}
        </Text>
      ) : null}
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
  });
