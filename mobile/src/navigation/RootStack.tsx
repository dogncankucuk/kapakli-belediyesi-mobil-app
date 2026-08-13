import { createNativeStackNavigator } from "@react-navigation/native-stack";

import RootTabs from "./RootTabs";
import AnnouncementsScreen from "../screens/AnnouncementsScreen";
import AseviScreen from "../screens/AseviScreen";
import AtikNoktalariScreen from "../screens/AtikNoktalariScreen";
import AtikRehberiScreen from "../screens/AtikRehberiScreen";
import AtikSiniflandirmaScreen from "../screens/AtikSiniflandirmaScreen";
import AyarlarScreen from "../screens/AyarlarScreen";
import BaskanScreen from "../screens/BaskanScreen";
import BizeUlasinScreen from "../screens/BizeUlasinScreen";
import EngelliYasliHizmetleriScreen from "../screens/EngelliYasliHizmetleriScreen";
import FaturaOdemeScreen from "../screens/FaturaOdemeScreen";
import FormlarVeDilekcelerScreen from "../screens/FormlarVeDilekcelerScreen";
import GuncelIcerikScreen from "../screens/GuncelIcerikScreen";
import HaberlerVeEtkinliklerScreen from "../screens/HaberlerVeEtkinliklerScreen";
import HakkimizdaScreen from "../screens/HakkimizdaScreen";
import HavaDurumuDetayScreen from "../screens/HavaDurumuDetayScreen";
import HavaKalitesiDetayScreen from "../screens/HavaKalitesiDetayScreen";
import MapScreen from "../screens/MapScreen";
import MeclisGundemleriScreen from "../screens/MeclisGundemleriScreen";
import MeclisKararlariScreen from "../screens/MeclisKararlariScreen";
import NobetciEczanelerScreen from "../screens/NobetciEczanelerScreen";
import OtobusTakipScreen from "../screens/OtobusTakipScreen";
import RandevuAlScreen from "../screens/RandevuAlScreen";
import SuHizmetleriScreen from "../screens/SuHizmetleriScreen";
import TaleplerimScreen from "../screens/TaleplerimScreen";
import UlasimHizmetleriScreen from "../screens/UlasimHizmetleriScreen";
import YardimMerkeziScreen from "../screens/YardimMerkeziScreen";
import YeniTalepOlusturScreen from "../screens/YeniTalepOlusturScreen";

// Alt sekmelerin (Home/Services/Map/Announcements/Profile) hangisinden
// acilirsa acilsin, birden fazla sekmeden erisilebilen ekranlar burada
// sekme yapisinin DISINDA, tek bir kok stack'te tutulur. Boylece geri
// tusu/goBack() her zaman gercekten gelinen ekrana doner - hedef ekranin
// bagli oldugu sekmenin ana sayfasina degil.
const RootStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    Tabs: RootTabs,
    Map: MapScreen,
    Announcements: AnnouncementsScreen,
    GuncelIcerik: GuncelIcerikScreen,
    MeclisGundemleri: MeclisGundemleriScreen,
    Baskan: BaskanScreen,
    Hakkimizda: HakkimizdaScreen,
    YardimMerkezi: YardimMerkeziScreen,
    BizeUlasin: BizeUlasinScreen,
    Ayarlar: AyarlarScreen,
    FaturaOdeme: FaturaOdemeScreen,
    SuHizmetleri: SuHizmetleriScreen,
    RandevuAl: RandevuAlScreen,
    YeniTalepOlustur: YeniTalepOlusturScreen,
    Taleplerim: TaleplerimScreen,
    FormlarVeDilekceler: FormlarVeDilekcelerScreen,
    EngelliYasliHizmetleri: EngelliYasliHizmetleriScreen,
    UlasimHizmetleri: UlasimHizmetleriScreen,
    OtobusTakip: OtobusTakipScreen,
    NobetciEczaneler: NobetciEczanelerScreen,
    AtikRehberi: AtikRehberiScreen,
    AtikNoktalari: AtikNoktalariScreen,
    AtikSiniflandirma: AtikSiniflandirmaScreen,
    Asevi: AseviScreen,
    HavaDurumuDetay: HavaDurumuDetayScreen,
    HavaKalitesiDetay: HavaKalitesiDetayScreen,
    HaberlerVeEtkinlikler: HaberlerVeEtkinliklerScreen,
    MeclisKararlari: MeclisKararlariScreen,
  },
});

export default RootStack;
