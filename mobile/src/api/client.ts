import { Platform } from "react-native";

// Test hedefine gore degistirin:
// - "emulator": Android Studio AVD - 10.0.2.2 emulator'un kendi ag arayuzunden
//   host makineye ulasmasini saglayan sabit bir alias'tir, IP guncellemesi gerekmez.
// - "physical-device": fiziksel telefon, host ile ayni Wi-Fi agindaysa
//   asagidaki DEV_MACHINE_LAN_IP kullanilir (AVD'nin varsayilan SLIRP agi host'un
//   gercek LAN IP'sine yonlendirme yapmaz, bu yuzden emulator'de calismaz).
const ANDROID_TARGET: "emulator" | "physical-device" = "physical-device";

// Sadece "physical-device" hedefinde kullanilir. Makine degisirse ("ipconfig" ile
// Wi-Fi adaptorunun IPv4 adresi) guncellenmesi gerekir.
const DEV_MACHINE_LAN_IP = "192.168.33.132";

const ANDROID_HOST =
  ANDROID_TARGET === "emulator" ? "10.0.2.2" : DEV_MACHINE_LAN_IP;

export const BASE_URL =
  Platform.OS === "android"
    ? `http://${ANDROID_HOST}:3000`
    : "http://localhost:3000";

// Admin panelin Medya Kutuphanesi'nden secilen dosyalar backend'den
// "/uploads/xxx.pdf" gibi goreceli bir yol olarak doner (admin panel ayni
// origin'den servis edildigi icin sorun degil) - mobil uygulama ayri bir
// origin'den calistigi icin Linking.openURL bu goreceli yolu acamaz. Mutlak
// (http/https) URL'lere dokunmadan sadece goreceli yollari BASE_URL ile
// tamamlar.
export function resolveMediaUrl(url: string): string {
  return url.startsWith("/") ? `${BASE_URL}${url}` : url;
}
