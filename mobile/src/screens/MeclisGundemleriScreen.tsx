import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

import { getMeclisGundemleri } from "../api/meclisGundemleri";
import { MeclisGundemi } from "../api/types";
import { Card, SegmentedControl } from "../components";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";
import { extractYoutubeId } from "../utils/youtube";

function yilFromTarih(tarih: string): string {
  return new Date(tarih).getFullYear().toString();
}

export default function MeclisGundemleriScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [gundemler, setGundemler] = useState<MeclisGundemi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [year, setYear] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getMeclisGundemleri()
      .then((data) => {
        setGundemler(data);
        if (data.length > 0) {
          setYear(yilFromTarih(data[0].tarih));
        }
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const years = useMemo(() => {
    const uniqueYears = new Set(gundemler.map((k) => yilFromTarih(k.tarih)));
    return Array.from(uniqueYears).sort((a, b) => Number(b) - Number(a));
  }, [gundemler]);

  const visibleGundemler = useMemo(
    () => gundemler.filter((k) => yilFromTarih(k.tarih) === year),
    [gundemler, year],
  );

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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t("meclisGundemleri_title")}
        </Text>
      </View>
      <View style={styles.content}>
        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("meclisGundemleri_error")}</Text>
        )}
        {!isLoading && !error && gundemler.length === 0 && (
          <Text style={styles.emptyText}>{t("meclisGundemleri_empty")}</Text>
        )}

        {!isLoading && !error && years.length > 0 && year && (
          <>
            <SegmentedControl
              options={years.map((y) => ({ label: y, value: y }))}
              value={year}
              onChange={setYear}
            />
            <View style={styles.list}>
              {visibleGundemler.map((item) => {
                const expanded = expandedId === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setExpandedId(expanded ? null : item.id)}
                    accessibilityRole="button"
                  >
                    <Card style={styles.card}>
                      <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.baslik}
                      </Text>
                      {item.icerik ? (
                        <Text
                          style={styles.itemSummary}
                          numberOfLines={expanded ? undefined : 2}
                        >
                          {item.icerik}
                        </Text>
                      ) : null}
                      {expanded &&
                        item.youtubeUrl &&
                        extractYoutubeId(item.youtubeUrl) && (
                          <View style={styles.videoContainer}>
                            <WebView
                              source={{
                                uri: `https://www.youtube.com/embed/${extractYoutubeId(item.youtubeUrl)}`,
                              }}
                              style={styles.video}
                              allowsFullscreenVideo
                            />
                          </View>
                        )}
                      {item.dosyaUrlleri.map((dosyaUrl, index) => (
                        <Pressable
                          key={dosyaUrl}
                          onPress={(e) => {
                            e.stopPropagation();
                            Linking.openURL(dosyaUrl);
                          }}
                          accessibilityRole="button"
                          style={styles.dosyaRow}
                        >
                          <MaterialIcons
                            name="picture-as-pdf"
                            size={18}
                            color={colors.secondary}
                          />
                          <Text style={styles.dosyaText}>
                            {t("guncelIcerik_dosyaIndir")}
                            {item.dosyaUrlleri.length > 1 ? ` ${index + 1}` : ''}
                          </Text>
                        </Pressable>
                      ))}
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
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
      flexShrink: 1,
    },
    content: {
      flex: 1,
      padding: spacing.containerMargin,
      gap: spacing.stackGap,
    },
    errorText: {
      ...typography.bodyMd,
      color: colors.error,
    },
    emptyText: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    list: {
      gap: spacing.stackGap,
    },
    card: {
      padding: spacing.stackGap,
      gap: 4,
    },
    itemTitle: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    itemSummary: {
      ...typography.bodyMd,
      color: colors.outline,
    },
    videoContainer: {
      aspectRatio: 16 / 9,
      borderRadius: shape.rounded,
      overflow: "hidden",
      marginTop: 4,
    },
    video: {
      flex: 1,
    },
    dosyaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
    },
    dosyaText: {
      ...typography.labelSm,
      color: colors.secondary,
      fontWeight: "600",
    },
  });
