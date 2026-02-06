import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Este código se ejecuta en el servidor en cada request
  let locale = await requestLocale;

  // Asegurar que el locale es uno válido
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'Europe/Madrid' // Zona horaria de España (Pevgrow)
  };
});
