import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Matcher para todas las rutas excepto:
  // - API routes
  // - _next/static (archivos estáticos)
  // - _next/image (optimización de imágenes)
  // - favicon.ico
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
