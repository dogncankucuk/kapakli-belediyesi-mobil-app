import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Vite ile Leaflet'in varsayilan marker ikonlari dogru cozumlenmiyor -
// bilinen bir sorun, standart duzeltme budur. Leaflet kullanan her modul
// bu dosyayi (yan etkisi icin) import eder.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export const KAPAKLI_CENTER: L.LatLngExpression = [41.33, 27.975];

export default L;
