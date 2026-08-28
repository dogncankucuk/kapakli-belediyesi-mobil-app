import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { getHavaDurumu } from "../api/havaDurumu";
import { HavaDurumu } from "../api/types";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, typography, useThemeColors } from "../theme";

type Props = {
  onSearchPress: () => void;
  searchActive?: boolean;
};

// Ana ekranlarin (Home/Hizmetler/Profil) app bar'inin sag ust kosesinde her
// zaman gorunen sabit ikili: gunun sicakligi + calisan bir arama tetikleyici.
// Hava verisi burada tek yerden cekilir, her ekran kendi kopyasini tutmaz.
export default function HavaVeAramaSag({ onSearchPress, searchActive }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [havaDurumu, setHavaDurumu] = useState<HavaDurumu | null>(null);

  useEffect(() => {
    getHavaDurumu()
      .then(setHavaDurumu)
      .catch(() => {
        // App bar'daki sicaklik bilgilendirme amacli - sessiz basarisizlik
        // kabul edilebilir, Hava sekmesi kendi hata durumunu gosterir.
      });
  }, []);

  return (
    <View style={styles.row}>
      {havaDurumu && (
        <Text style={styles.temp}>{Math.round(havaDurumu.sicaklik)}°C</Text>
      )}
      <Pressable
        onPress={onSearchPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t("common_search")}
      >
        <MaterialIcons
          name={searchActive ? "close" : "search"}
          size={22}
          color={colors.onPrimary}
        />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    temp: {
      ...typography.labelLg,
      color: colors.onPrimary,
    },
  });
