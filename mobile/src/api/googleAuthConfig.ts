// Google Cloud Console > APIs & Services > Credentials'dan alinan "Web application"
// tipi OAuth 2.0 Client ID buraya girilmeli. Bos birakilirsa "Google ile Devam Et"
// butonu bir hata mesaji gosterir, uygulamanin geri kalani etkilenmez.
// Not: expo-auth-session'in tarayici tabanli akisi kullanildigi icin (native
// @react-native-google-signin/google-signin ozel bir dev build gerektirir ve
// su an Expo Go ile calismiyor), sadece "Web application" turu Client ID yeterlidir.
export const GOOGLE_WEB_CLIENT_ID =
  "364305728235-87hmhlmhrgp07944u1a0aqls82ot9c0d.apps.googleusercontent.com";
