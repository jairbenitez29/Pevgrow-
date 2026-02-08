'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import ProductGrid from '@/components/products/ProductGrid';
import Loader from '@/components/ui/Loader';

export default function FeaturedProducts() {
  const t = useTranslations();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        // Primero intentar obtener productos destacados
        const featuredRes = await fetch('/api/products/featured?limit=8');
        const featuredData = await featuredRes.json();

        if (featuredData.success && featuredData.data.length > 0) {
          setProducts(featuredData.data);
        } else {
          // Si no hay destacados, obtener productos normales con preferencia a los en oferta
          const regularRes = await fetch('/api/product?limit=20');
          const regularData = await regularRes.json();

          if (regularData.data) {
            // Ordenar: primero con descuento
            const sorted = [...regularData.data].sort((a: any, b: any) => {
              const aHasDiscount = a.is_sale_enable && a.discount > 0;
              const bHasDiscount = b.is_sale_enable && b.discount > 0;

              if (aHasDiscount && !bHasDiscount) return -1;
              if (!aHasDiscount && bHasDiscount) return 1;
              return 0;
            });

            setProducts(sorted.slice(0, 8));
          }
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeaturedProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 bg-white border-t-4 border-purple-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-900 px-4 py-1 rounded-full text-sm font-bold mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              SELECCIÓN ESPECIAL
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Productos Destacados
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Los productos más recientes y populares de nuestra tienda
            </p>
          </div>
          <div className="flex justify-center py-12">
            <Loader size="lg" text={t('common.loading')} />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white border-t-4 border-purple-900">
      <div className="container mx-auto px-4">
        {/* Header de sección con estilo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-900 px-4 py-1 rounded-full text-sm font-bold mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            DESDE PRESTASHOP
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Productos Destacados
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Los productos más recientes y populares de nuestra tienda
          </p>
        </div>

        <ProductGrid products={products} columns={4} />

        <div className="text-center mt-12">
          <Link href="/productos">
            <button className="group bg-purple-900 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-purple-800 transition-all shadow-lg hover:shadow-2xl hover:scale-105 inline-flex items-center gap-2">
              Ver Todos los Productos
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
