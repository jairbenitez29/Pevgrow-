'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

// IDs de las categorias destacadas en Pevgrow
const FEATURED_CATEGORY_IDS = [1007, 1008, 1168, 4701, 9, 4900];

export default function FeaturedCategories() {
  const t = useTranslations();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        // Cargar solo las categorias especificas por ID
        const ids = FEATURED_CATEGORY_IDS.join(',');
        const response = await fetch(`/api/category/featured?ids=${ids}`);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
          // Ordenar segun el orden de FEATURED_CATEGORY_IDS
          const ordered = FEATURED_CATEGORY_IDS
            .map(id => data.data.find((cat: any) => {
              const catId = typeof cat.id === 'string' ? parseInt(cat.id) : cat.id;
              return catId === id;
            }))
            .filter(Boolean);
          setCategories(ordered);
        }
      } catch (error) {
        console.error('Error loading featured categories:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-900 px-4 py-1 rounded-full text-sm font-bold mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              EXPLORA POR CATEGORÍA
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              {t('common.categories')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Encuentra exactamente lo que buscas navegando por nuestras categorías principales
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden animate-pulse">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-4 text-center">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-900 px-4 py-1 rounded-full text-sm font-bold mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            EXPLORA POR CATEGORIA
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            {t('common.categories')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encuentra exactamente lo que buscas navegando por nuestras categorias principales
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category: any) => (
            <Link
              key={category.id}
              href={`/categoria/${category.slug}`}
              className="group"
            >
              <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-purple-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Imagen de la categoría */}
                <div className="relative h-32 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
                  {category.category_image ? (
                    <Image
                      src={category.category_image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="200px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-4 text-center bg-white">
                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-purple-900 transition-colors line-clamp-2 mb-2">
                    {category.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1 text-xs text-purple-600 font-semibold group-hover:text-purple-900 transition-colors">
                    <span>Explorar</span>
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
