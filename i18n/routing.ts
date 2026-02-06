import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // Lista de idiomas soportados
  locales: ['es', 'en', 'fr', 'de', 'it'],

  // Idioma por defecto
  defaultLocale: 'es',

  // Prefijo de ruta para el idioma por defecto
  localePrefix: 'as-needed' // /es/productos -> /productos (español), /en/products -> /en/products
});

// Exportar funciones de navegación con tipos
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
