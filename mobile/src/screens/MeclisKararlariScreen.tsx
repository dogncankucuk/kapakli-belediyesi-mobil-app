import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

import { getMeclisKararlari, MeclisKarari } from "../api/meclisKararlari";
import { Card, SegmentedControl, ZenginMetinGoster } from "../components";
import { htmlToDuzMetin } from "../utils/html";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, Typography, useThemeColors, useTypography } from "../theme";
import { extractYoutubeId } from "../utils/youtube";

function yilFromTarih(tarih: string): string {
  return new Date(tarih).getFullYear().toString();
}

export default function MeclisKararlariScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );
  const [kararlar, setKararlar] = useState<MeclisKarari[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [year, setYear] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getMeclisKararlari()
      .then((data) => {
        setKararlar(data);
        if (data.length > 0) {
          setYear(yilFromTarih(data[0].tarih));
        }
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const years = useMemo(() => {
    const uniqueYears = new Set(kararlar.map((k) => yilFromTarih(k.tarih)));
    return Array.from(uniqueYears).sort((a, b) => Number(b) - Number(a));
  }, [kararlar]);

  const visibleKararlar = useMemo(
    () => kararlar.filter((k) => yilFromTarih(k.tarih) === year),
    [kararlar, year],
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
          {t("meclisKararlari_title")}
        </Text>
      </View>
      <View style={styles.content}>
        {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
        {!isLoading && error && (
          <Text style={styles.errorText}>{t("meclisKararlari_error")}</Text>
        )}
        {!isLoading && !error && kararlar.length === 0 && (
          <Text style={styles.emptyText}>{t("meclisKararlari_empty")}</Text>
        )}

        {!isLoading && !error && years.length > 0 && year && (
          <>
            <SegmentedControl
              options={years.map((y) => ({ label: y, value: y }))}
              value={year}
              onChange={setYear}
            />
            <View style={styles.list}>
              {visibleKararlar.map((item) => {
                const expanded = expandedId === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setExpandedId(expanded ? null : item.id)}
                    accessibilityRole="button"
                  >
                    <Card style={styles.card}>
                      {item.resimUrlleri.length > 0 && (
                        <Image
                          source={{ uri: item.resimUrlleri[0] }}
                          style={styles.itemImage}
                          resizeMode="cover"
                        />
                      )}
                      <View style={styles.cardHeader}>
                        <Text style={styles.kararNo}>{item.kararNo}</Text>
                        <Text style={styles.kategori}>{item.kategori}</Text>
                      </View>
                      <Text
                        style={styles.decisionTitle}
                        numberOfLines={expanded ? undefined : 2}
                      >
                        {item.baslik}
                      </Text>
                      {item.icerik ? (
                        expanded ? (
                          <ZenginMetinGoster html={item.icerik} />
                        ) : (
                          <Text style={styles.itemSummary} numberOfLines={2}>
                            {htmlToDuzMetin(item.icerik)}
                          </Text>
                        )
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
                      <View style={styles.itemFooter}>
                        <Text style={styles.itemDate}>
                          {new Date(item.tarih).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </Text>
                        <MaterialIcons
                          name={expanded ? "expand-less" : "expand-more"}
                          size={18}
                          color={colors.secondary}
                        />
                      </View>
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

const createStyles = (colors: Colors, typography: Typography) =>
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
    itemImage: {
      width: "100%",
      aspectRatio: 16 / 9,
      borderRadius: shape.rounded,
      marginBottom: 4,
      backgroundColor: colors.outlineVariant,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap / 2,
    },
    kararNo: {
      ...typography.labelLg,
      color: colors.onBackground,
    },
    kategori: {
      ...typography.labelSm,
      color: colors.secondary,
    },
    decisionTitle: {
      ...typography.bodyMd,
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
    itemFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 4,
    },
    itemDate: {
      ...typography.labelSm,
      color: colors.secondary,
    },
    dosyaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 8,
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
