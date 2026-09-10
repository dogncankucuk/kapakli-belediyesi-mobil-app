// app.json yerine: EAS Build bulutunda google-services.json git'e eklenmedigi
// icin (bkz. .gitignore) GOOGLE_SERVICES_JSON adinda guvenli bir EAS dosya
// ortam degiskeni olarak yuklendi - derleme sirasinda EAS bu degiskeni
// gecici bir dosya yoluna cozer, yerelde ise dosya zaten diskte oldugu icin
// varsayilan yol kullanilir.
const config = require("./app.json");

config.expo.android.googleServicesFile =
  process.env.GOOGLE_SERVICES_JSON || "./google-services.json";

module.exports = config;
