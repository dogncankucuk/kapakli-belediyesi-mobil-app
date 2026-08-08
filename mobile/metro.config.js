const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// react-native-safe-area-context ve expo-modules-core, Windows'ta 260 karakter
// dosya yolu sinirina takilan native (C++) build hatasini asmak icin
// C:\rnsac ve C:\emc'ye tasinip node_modules icindeki eski konumlarina junction
// olarak baglandi (bkz. proje notlari). Metro bu gercek konumlari kendi
// node_modules aramasinda bulamadigi icin watchFolders'a eklemek ve symlink
// (junction) desteğini acmak gerekiyor.
config.watchFolders = [
  ...(config.watchFolders || []),
  "C:\\rnsac",
  "C:\\emc",
];
config.resolver.unstable_enableSymlinks = true;
// Windows'ta gercek symlink (mklink /D) icin admin/Developer Mode gerekiyor,
// bu makinede yok - bunun yerine NTFS junction (mklink /J) kullanildi ama
// Node'un fs modulu junction'lari symlink olarak tanimadigi icin
// unstable_enableSymlinks tek basina yetmiyor: Metro, C:\rnsac ve C:\emc
// altindaki dosyalardan "react" gibi paketleri cozerken bu klasorlerin
// ata zincirinde node_modules bulamiyor. nodeModulesPaths ile projenin
// gercek node_modules'unu ek arama yolu olarak ekliyoruz.
config.resolver.nodeModulesPaths = [
  ...(config.resolver.nodeModulesPaths || []),
  "C:\\Users\\gurka\\Desktop\\kapakli-belediye\\kapakli-belediyesi-mobil-app-2\\mobile\\node_modules",
];

module.exports = config;
