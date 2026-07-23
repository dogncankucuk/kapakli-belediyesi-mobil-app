import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAnnouncements } from "../api/announcements";
import { Announcement } from "../api/types";
import { AnnouncementCard, SegmentedControl } from "../components";
import { colors, spacing, typography } from "../theme";

type ContentType = "haberler" | "etkinlikler";

// admin-panel'de duyuru olusturulurken kategori alanina girilen deger - bu
// ekranda "Haberler"/"Etkinlikler" ayrimi bu kategoriye gore yapilir.
const ETKINLIK_KATEGORISI = "etkinlik";

function formatAnnouncementDate(item: Announcement): string {
  return new Date(item.yayinTarihi).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function HaberlerVeEtkinliklerScreen() {
  const navigation = useNavigation();
  const [contentType, setContentType] = useState<ContentType>("haberler");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAnnouncements()
      .then(setAnnouncements)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const haberler = useMemo(
    () => announcements.filter((item) => item.kategori !== ETKINLIK_KATEGORISI),
    [announcements],
  );
  const etkinlikler = useMemo(
    () => announcements.filter((item) => item.kategori === ETKINLIK_KATEGORISI),
    [announcements],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Geri dön"
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Haberler ve Etkinlikler
        </Text>
      </View>
      <View style={styles.content}>
        <SegmentedControl
          options={[
            { label: "Haberler", value: "haberler" },
            { label: "Etkinlikler", value: "etkinlikler" },
          ]}
          value={contentType}
          onChange={setContentType}
        />
        <View style={styles.list}>
          {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
          {!isLoading && error && (
            <Text style={styles.errorText}>
              {contentType === "haberler"
                ? "Haberler yüklenemedi."
                : "Etkinlikler yüklenemedi."}
            </Text>
          )}
          {!isLoading &&
            !error &&
            (contentType === "haberler" ? haberler : etkinlikler).length ===
              0 && (
              <Text style={styles.errorText}>
                {contentType === "haberler"
                  ? "Henüz haber eklenmemiş."
                  : "Henüz etkinlik eklenmemiş."}
              </Text>
            )}
          {!isLoading &&
            !error &&
            (contentType === "haberler" ? haberler : etkinlikler).map(
              (item) => (
                <AnnouncementCard
                  key={item.id}
                  title={item.baslik}
                  date={formatAnnouncementDate(item)}
                />
              ),
            )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  list: {
    gap: spacing.stackGap,
  },
  errorText: {
    ...typography.bodyMd,
    color: colors.error,
  },
});
