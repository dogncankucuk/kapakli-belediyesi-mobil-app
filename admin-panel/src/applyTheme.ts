export type PanelTemasiValues = {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
  fontFamily: string;
  radius: number;
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const value = parseInt(full, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, '0'))
      .join('')
  );
}

function mix(hex: string, targetHex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [tr, tg, tb] = hexToRgb(targetHex);
  return rgbToHex(r + (tr - r) * amount, g + (tg - g) * amount, b + (tb - b) * amount);
}

function lighten(hex: string, amount: number): string {
  return mix(hex, '#ffffff', amount);
}

function darken(hex: string, amount: number): string {
  return mix(hex, '#000000', amount);
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Panel temasini <html> uzerine CSS custom property olarak yazar - index.css
// icindeki tum --color-*/--radius-*/font degiskenleri boylece anlik
// degisir, sayfa yenilemeye gerek kalmaz. Login ekrani dahil tum sayfalar
// bu degiskenleri kullandigi icin tek noktadan tema degisir.
export function applyPanelTemasi(tema: PanelTemasiValues): void {
  const root = document.documentElement.style;
  root.setProperty('--color-primary', tema.primaryColor);
  root.setProperty('--color-primary-dark', darken(tema.primaryColor, 0.25));
  root.setProperty('--color-primary-light', lighten(tema.primaryColor, 0.85));
  root.setProperty('--color-secondary', tema.secondaryColor);
  root.setProperty('--color-bg', tema.backgroundColor);
  root.setProperty('--color-surface', tema.surfaceColor);
  root.setProperty('--color-border', tema.borderColor);
  root.setProperty('--color-text', tema.textColor);
  root.setProperty('--color-text-muted', lighten(tema.textColor, 0.45));
  root.setProperty('--radius-sm', `${Math.round(tema.radius * 0.6)}px`);
  root.setProperty('--radius-md', `${Math.round(tema.radius)}px`);
  root.setProperty('--radius-lg', `${Math.round(tema.radius * 1.6)}px`);
  root.setProperty(
    '--shadow-sm',
    `0 1px 2px ${rgba(tema.primaryColor, 0.06)}, 0 1px 3px ${rgba(tema.primaryColor, 0.08)}`,
  );
  root.setProperty(
    '--shadow-md',
    `0 6px 16px ${rgba(tema.primaryColor, 0.1)}, 0 2px 6px ${rgba(tema.primaryColor, 0.06)}`,
  );
  document.body.style.fontFamily = tema.fontFamily;
}
