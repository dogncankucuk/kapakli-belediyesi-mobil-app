import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ComponentProps } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ServiceGridCard, TopBar } from "../components";
import { useAppShell } from "../navigation/AppShellContext";
import { colors, spacing, typography } from "../theme";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

type ServiceItem = {
  id: string;
  icon: IconName;
  label: string;
  onPress: () => void;
};

export default function ServicesScreen() {
  const navigation = useNavigation();
  const { openMenu } = useAppShell();

  // design.md §4 "Hizmet Kategorileri" tam listesi + route key contract
  // üzerinden diğer sekmelerdeki karşılıklarına çapraz-navigasyon.
  const services: ServiceItem[] = [
    {
      id: "fatura-odeme",
      icon: "receipt-long",
      label: "Fatura Ödeme ve Kart Dolumu",
      onPress: () => navigation.navigate("FaturaOdeme" as never),
    },
    {
      id: "su-hizmetleri",
      icon: "water-drop",
      label: "Su Hizmetleri",
      onPress: () => navigation.navigate("SuHizmetleri" as never),
    },
    {
      id: "randevu-al",
      icon: "event",
      label: "Randevu Al",
      onPress: () => navigation.navigate("RandevuAl" as never),
    },
    {
      id: "yeni-talep",
      icon: "post-add",
      label: "Yeni Talep Oluştur",
      onPress: () => navigation.navigate("YeniTalepOlustur" as never),
    },
    {
      id: "taleplerim",
      icon: "assignment",
      label: "Taleplerim",
      onPress: () => navigation.navigate("Taleplerim" as never),
    },
    {
      id: "formlar",
      icon: "description",
      label: "Formlar ve Dilekçeler",
      onPress: () => navigation.navigate("FormlarVeDilekceler" as never),
    },
    {
      id: "engelli-yasli",
      icon: "accessible",
      label: "Engelli ve Yaşlı Hizmetleri",
      onPress: () => navigation.navigate("EngelliYasliHizmetleri" as never),
    },
    {
      id: "ulasim",
      icon: "directions-bus",
      label: "Ulaşım (Otobüsüm Nerede)",
      onPress: () =>
        navigation.navigate("Map", {
          screen: "UlasimHizmetleri",
        } as never),
    },
    {
      id: "nobetci-eczane",
      icon: "local-pharmacy",
      label: "Nöbetçi Eczaneler",
      onPress: () =>
        navigation.navigate("Map", {
          screen: "NobetciEczaneler",
        } as never),
    },
    {
      id: "wifi",
      icon: "wifi",
      label: "Wi-Fi Noktaları",
      onPress: () =>
        navigation.navigate("Map", { screen: "WifiNoktalari" } as never),
    },
    {
      id: "sehir-kameralari",
      icon: "videocam",
      label: "Şehir Kameraları",
      onPress: () =>
        navigation.navigate("Map", {
          screen: "SehirKameralari",
        } as never),
    },
    {
      id: "kent-lokantasi",
      icon: "restaurant",
      label: "Kent Lokantası",
      onPress: () =>
        navigation.navigate("Map", { screen: "KentLokantasi" } as never),
    },
    {
      id: "hava-durumu",
      icon: "wb-sunny",
      label: "Hava Durumu",
      onPress: () =>
        navigation.navigate("Announcements", {
          screen: "HavaDurumuDetay",
        } as never),
    },
    {
      id: "hava-kalitesi",
      icon: "air",
      label: "Hava Kirlilik Göstergesi",
      onPress: () =>
        navigation.navigate("Announcements", {
          screen: "HavaKalitesiDetay",
        } as never),
    },
    {
      id: "etkinlik-tarihleri",
      icon: "campaign",
      label: "Etkinlik Tarihleri",
      onPress: () =>
        navigation.navigate("Announcements", {
          screen: "HaberlerVeEtkinlikler",
        } as never),
    },
    {
      id: "meclis-kararlari",
      icon: "gavel",
      label: "Meclis Kararları",
      onPress: () =>
        navigation.navigate("Announcements", {
          screen: "MeclisKararlari",
        } as never),
    },
    {
      id: "hakkimizda",
      icon: "info",
      label: "Hakkımızda",
      onPress: () =>
        navigation.navigate("Profile", { screen: "Hakkimizda" } as never),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopBar
        title="Kapaklı Belediyesi"
        onMenuPress={openMenu}
        rightSlot={
          <MaterialIcons name="search" size={24} color={colors.onPrimary} />
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.title}>Belediye Hizmetleri</Text>
          <Text style={styles.subtitle}>Size nasıl yardımcı olabiliriz?</Text>
        </View>

        <View style={styles.grid}>
          {services.map((service) => (
            <View key={service.id} style={styles.gridItem}>
              <ServiceGridCard
                icon={service.icon}
                label={service.label}
                onPress={service.onPress}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.containerMargin,
    gap: spacing.containerMargin,
  },
  title: {
    ...typography.headlineMdMobile,
    color: colors.onBackground,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.gridGutter,
  },
  gridItem: {
    width: "31%",
  },
});
