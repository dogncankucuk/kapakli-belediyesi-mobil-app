import { MaterialIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";

import { TranslationKey } from "../i18n/tr";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

export type ServiceTarget = {
  tab: "Map" | "Services" | "Announcements" | "Profile";
  screen: string;
};

export type ServiceId =
  | "fatura-odeme"
  | "su-hizmetleri"
  | "randevu-al"
  | "yeni-talep"
  | "taleplerim"
  | "formlar"
  | "engelli-yasli"
  | "ulasim"
  | "nobetci-eczane"
  | "wifi"
  | "sehir-kameralari"
  | "kent-lokantasi"
  | "hava-durumu"
  | "hava-kalitesi"
  | "etkinlik-tarihleri"
  | "meclis-kararlari"
  | "hakkimizda";

export type ServiceDefinition = {
  id: ServiceId;
  icon: IconName;
  labelKey: TranslationKey;
  target: ServiceTarget;
};

// design.md §4 "Hizmet Kategorileri" tam listesi + route key contract.
// ServicesScreen ve ana sayfadaki "Hızlı İşlemler" düzenleyicisi bu tek
// kataloğu paylaşır.
export const SERVICE_CATALOG: ServiceDefinition[] = [
  {
    id: "fatura-odeme",
    icon: "receipt-long",
    labelKey: "services_faturaOdeme",
    target: { tab: "Services", screen: "FaturaOdeme" },
  },
  {
    id: "su-hizmetleri",
    icon: "water-drop",
    labelKey: "services_suHizmetleri",
    target: { tab: "Services", screen: "SuHizmetleri" },
  },
  {
    id: "randevu-al",
    icon: "event",
    labelKey: "services_randevuAl",
    target: { tab: "Services", screen: "RandevuAl" },
  },
  {
    id: "yeni-talep",
    icon: "post-add",
    labelKey: "services_yeniTalep",
    target: { tab: "Services", screen: "YeniTalepOlustur" },
  },
  {
    id: "taleplerim",
    icon: "assignment",
    labelKey: "services_taleplerim",
    target: { tab: "Services", screen: "Taleplerim" },
  },
  {
    id: "formlar",
    icon: "description",
    labelKey: "services_formlar",
    target: { tab: "Services", screen: "FormlarVeDilekceler" },
  },
  {
    id: "engelli-yasli",
    icon: "accessible",
    labelKey: "services_engelliYasli",
    target: { tab: "Services", screen: "EngelliYasliHizmetleri" },
  },
  {
    id: "ulasim",
    icon: "directions-bus",
    labelKey: "services_ulasim",
    target: { tab: "Map", screen: "UlasimHizmetleri" },
  },
  {
    id: "nobetci-eczane",
    icon: "local-pharmacy",
    labelKey: "services_nobetciEczane",
    target: { tab: "Map", screen: "NobetciEczaneler" },
  },
  {
    id: "wifi",
    icon: "wifi",
    labelKey: "services_wifi",
    target: { tab: "Map", screen: "WifiNoktalari" },
  },
  {
    id: "sehir-kameralari",
    icon: "videocam",
    labelKey: "services_sehirKameralari",
    target: { tab: "Map", screen: "SehirKameralari" },
  },
  {
    id: "kent-lokantasi",
    icon: "restaurant",
    labelKey: "services_kentLokantasi",
    target: { tab: "Map", screen: "KentLokantasi" },
  },
  {
    id: "hava-durumu",
    icon: "wb-sunny",
    labelKey: "services_havaDurumu",
    target: { tab: "Announcements", screen: "HavaDurumuDetay" },
  },
  {
    id: "hava-kalitesi",
    icon: "air",
    labelKey: "services_havaKalitesi",
    target: { tab: "Announcements", screen: "HavaKalitesiDetay" },
  },
  {
    id: "etkinlik-tarihleri",
    icon: "campaign",
    labelKey: "services_etkinlikTarihleri",
    target: { tab: "Announcements", screen: "HaberlerVeEtkinlikler" },
  },
  {
    id: "meclis-kararlari",
    icon: "gavel",
    labelKey: "services_meclisKararlari",
    target: { tab: "Announcements", screen: "MeclisKararlari" },
  },
  {
    id: "hakkimizda",
    icon: "info",
    labelKey: "services_hakkimizda",
    target: { tab: "Profile", screen: "Hakkimizda" },
  },
];

export const DEFAULT_QUICK_ACTION_IDS: ServiceId[] = [
  "nobetci-eczane",
  "etkinlik-tarihleri",
];

export function getServiceDefinition(
  id: ServiceId,
): ServiceDefinition | undefined {
  return SERVICE_CATALOG.find((service) => service.id === id);
}

type NavigateFn = { navigate: (screen: string, params?: object) => void };

export function navigateToServiceTarget(
  navigation: NavigateFn,
  target: ServiceTarget,
): void {
  navigation.navigate(target.screen);
}
