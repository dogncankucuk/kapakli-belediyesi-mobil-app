import { useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";
import { useThemeColors, useTypography } from "../theme";

interface Props {
  html: string;
}

// Admin panelde Word-benzeri zengin metin editoruyle girilen icerigi
// (kalin/italik/altı çizili/yazı tipi/boyutu) mobilde aynen gostermek icin -
// duz <Text> yerine bu kullanilir. Eski (zengin metin oncesi) kayitlarda
// icerik duz metin olabilir, RenderHtml bunu tek bir paragraf olarak
// sorunsuz gosterir.
function ZenginMetinGoster({ html }: Props) {
  const { width } = useWindowDimensions();
  const colors = useThemeColors();
  const typography = useTypography();

  if (!html) return null;

  return (
    <RenderHtml
      contentWidth={width}
      source={{ html }}
      baseStyle={{
        color: colors.onBackground,
        fontSize: typography.bodyLg.fontSize,
        lineHeight: typography.bodyLg.lineHeight,
      }}
    />
  );
}

export default ZenginMetinGoster;
