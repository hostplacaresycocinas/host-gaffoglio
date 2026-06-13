import { GoogleAnalytics } from '@next/third-parties/google';

/**
 * Carga Google Analytics 4 (gtag) en el sitio público.
 *
 * Requiere `NEXT_PUBLIC_GA_MEASUREMENT_ID` (formato `G-XXXXXX`) en el entorno.
 * Si la variable no está, no carga nada (ni rompe).
 *
 * IMPORTANTE al migrar a un proyecto nuevo: verificá que la variable apunte
 * al Measurement ID correcto de ese proyecto antes de hacer deploy, así
 * no contaminás los analytics de otra concesionaria.
 */
export function SiteGoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!gaId) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
