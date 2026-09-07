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
  | "elektrik-ve-su-kesintileri"
  | "randevu-al"
  | "yeni-talep"
  | "taleplerim"
  | "formlar"
  | "ulasim"
  | "nobetci-eczane"
  | "atik-noktalari"
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
    id: "elektrik-ve-su-kesintileri",
    icon: "bolt",
    labelKey: "services_elektrikVeSuKesintileri",
    target: { tab: "Services", screen: "ElektrikVeSuKesintileri" },
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
    id: "atik-noktalari",
    icon: "recycling",
    labelKey: "services_atikNoktalari",
    target: { tab: "Services", screen: "AtikRehberi" },
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

// Hizmetler ekranindan kaldirilmasi istenen kisayollar - Hizli Islemler
// duzenleyicisi de SADECE aktif olarak Hizmetler'de goruntulenenlerden secim
// yaptirmali, bu yuzden ayni filtreyi paylasiyorlar (tek kaynak).
const HIDDEN_ON_SERVICES_SCREEN: ServiceId[] = [
  "yeni-talep",
  "taleplerim",
  "etkinlik-tarihleri",
  "hakkimizda",
  "meclis-kararlari",
];

export const VISIBLE_SERVICE_CATALOG: ServiceDefinition[] =
  SERVICE_CATALOG.filter(
    (service) => !HIDDEN_ON_SERVICES_SCREEN.includes(service.id),
  );

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
