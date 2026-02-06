'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useCategories } from '@/lib/hooks/useCategories';
import { useProducts } from '@/lib/hooks/useProducts';

export default function HeroBanner() {
  const t = useTranslations();
  const { data: categoriesData } = useCategories({ limit: 10 });
  const { data: productsData } = useProducts({ limit: 5 });

  const categories = categoriesData?.data || [];
  const products = productsData?.data || [];

  // Obtener la primera categoría principal para el banner
  const mainCategory = categories.find((cat: any) =>
    cat.slug && cat.slug.includes('semillas')
  ) || categories[0];

  // Contar productos con descuento
  const productsWithDiscount = products.filter((p: any) =>
    p.is_sale_enable && p.discount > 0
  );

  const discountText = productsWithDiscount.length > 0
    ? `${productsWithDiscount.length} productos en oferta`
    : t('header.discount');

  return (
    <section className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-pink-700 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge de Oferta - Dinámico */}
          {productsWithDiscount.length > 0 && (
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-purple-900 px-4 py-2 rounded-full font-bold text-sm mb-6 animate-pulse">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              OFERTA ESPECIAL: {discountText}
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            {mainCategory ? (
              <>
                Descubre Nuestras
                <span className="block text-yellow-300">{mainCategory.name}</span>
              </>
            ) : (
              <>
                Las Mejores Semillas de
                <span className="block text-yellow-300">Cannabis del Mercado</span>
              </>
            )}
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-purple-100">
            {t('header.freeShipping')} · Entrega discreta · {products.length}+ productos disponibles
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/productos">
              <button className="bg-white text-purple-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 hover:scale-105 transition-all shadow-lg">
                Ver Todos los Productos
              </button>
            </Link>
            {mainCategory && (
              <Link href={`/categoria/${mainCategory.slug}`}>
                <button className="bg-purple-700 bg-opacity-50 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-70 transition-all">
                  {mainCategory.name}
                </button>
              </Link>
            )}
          </div>

          {/* Trust badges - Basados en datos reales */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold">{products.length}+</div>
              <div className="text-sm text-purple-200">Productos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{categories.length}+</div>
              <div className="text-sm text-purple-200">Categorías</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-purple-200">Calidad</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
