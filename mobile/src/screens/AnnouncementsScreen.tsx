import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAnnouncements } from "../api/announcements";
import { Announcement } from "../api/types";
import {
  AnnouncementCard,
  PaginationDots,
  PrimaryButton,
  TopBar,
} from "../components";
import { useAppShell } from "../navigation/AppShellContext";
import { colors, spacing, typography } from "../theme";

function formatAnnouncementDate(item: Announcement): string {
  return new Date(item.yayinTarihi).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AnnouncementsScreen() {
  const navigation = useNavigation();
  const { openMenu } = useAppShell();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAnnouncements()
      .then(setAnnouncements)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar title="Duyurular" onMenuPress={openMenu} />
      <View style={styles.content}>
        <View style={styles.list}>
          {isLoading && <ActivityIndicator color={colors.primaryContainer} />}
          {!isLoading && error && (
            <Text style={styles.errorText}>Duyurular yüklenemedi.</Text>
          )}
          {!isLoading &&
            !error &&
            announcements.map((item) => (
              <AnnouncementCard
                key={item.id}
                title={item.baslik}
                date={formatAnnouncementDate(item)}
              />
            ))}
        </View>
        <View style={styles.footer}>
          <PaginationDots count={announcements.length} activeIndex={0} />
          <PrimaryButton
            label="Tümünü Gör"
            onPress={() =>
              navigation.navigate("HaberlerVeEtkinlikler" as never)
            }
          />
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
  content: {
    flex: 1,
    padding: spacing.containerMargin,
    justifyContent: "space-between",
  },
  list: {
    gap: spacing.stackGap,
  },
  footer: {
    gap: spacing.stackGap,
    alignItems: "center",
  },
  errorText: {
    ...typography.bodyMd,
    color: colors.error,
  },
});
