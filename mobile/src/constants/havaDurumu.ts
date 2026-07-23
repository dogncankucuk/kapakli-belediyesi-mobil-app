import { MaterialIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

const YAGISLI_KODLAR = [
  "HY",
  "Y",
  "KY",
  "HSY",
  "SY",
  "KSY",
  "MSY",
  "DY",
  "GSY",
  "KGY",
  "HHY",
];
const KARLI_KODLAR = ["K", "HKY", "YKY", "KKY"];
const SISLI_KODLAR = ["SIS", "PUS", "DMN"];

// MGM hadise kodlarini (bkz. backend hava-durumu.service.ts) basit bir
// MaterialIcons setine esler.
export function havaDurumuIkonu(durumKodu: string): IconName {
  if (durumKodu === "A") return "wb-sunny";
  if (YAGISLI_KODLAR.includes(durumKodu)) return "grain";
  if (KARLI_KODLAR.includes(durumKodu)) return "ac-unit";
  if (SISLI_KODLAR.includes(durumKodu)) return "blur-on";
  return "wb-cloudy";
}
