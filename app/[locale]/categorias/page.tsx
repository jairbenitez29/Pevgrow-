'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCategories } from '@/lib/hooks/useCategories';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import Loader from '@/components/ui/Loader';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

interface CategoriesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default function CategoriesPage({ params }: CategoriesPageProps) {
  const t = useTranslations();
  const [locale, setLocale] = useState<string>('');

  // Unwrap params
  useEffect(() => {
    params.then((p) => {
      setLocale(p.locale);
    });
  }, [params]);

  const { data: categoriesData, isLoading } = useCategories({ limit: 3000 });
  const allCategories = categoriesData?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" text={t('common.loading')} />
      </div>
    );
  }

  // Filtrar solo categorías principales (nivel 2 y 3)
  // Nivel 1 = Raíz, Nivel 2 = Categorías principales, Nivel 3 = Subcategorías
  const mainCategories = allCategories
    .filter((cat: any) => cat.active && cat.level_depth >= 2 && cat.level_depth <= 3 && cat.products_count > 0)
    .sort((a: any, b: any) => {
      // Ordenar por level_depth primero, luego por nombre
      if (a.level_depth !== b.level_depth) {
        return a.level_depth - b.level_depth;
      }
      return a.name.localeCompare(b.name);
    });

  // Agrupar por categoría padre
  const categoriesByParent = mainCategories.reduce((acc: any, cat: any) => {
    const parentId = cat.parent_id || 0;
    if (!acc[parentId]) {
      acc[parentId] = [];
    }
    acc[parentId].push(cat);
    return acc;
  }, {});

  // Obtener categorías de nivel 2 (principales)
  const topLevelCategories = mainCategories.filter((cat: any) => cat.level_depth === 2);

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: t('common.categories'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('common.categories')}
          </h1>
          <p className="text-gray-600">
            Explora todas nuestras categorías de productos
          </p>
        </div>

        {/* Categorías principales con sus subcategorías */}
        <div className="space-y-12">
          {topLevelCategories.map((mainCat: any) => {
            const subcategories = categoriesByParent[mainCat.id] || [];

            return (
              <div key={mainCat.id} className="bg-white rounded-lg shadow-sm p-6">
                {/* Título de categoría principal */}
                <div className="mb-6">
                  <Link
                    href={`/categoria/${mainCat.slug}`}
                    className="group inline-flex items-center gap-3"
                  >
                    {mainCat.category_image && (
                      <div className="relative w-12 h-12">
                        <Image
                          src={mainCat.category_image}
                          alt={mainCat.name}
                          fill
                          className="object-cover rounded-lg"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 group-hover:text-purple-900 transition">
                        {mainCat.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {mainCat.products_count} productos
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Grid de subcategorías */}
                {subcategories.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {subcategories.map((subcat: any) => (
                      <Link
                        key={subcat.id}
                        href={`/categoria/${subcat.slug}`}
                        className="group"
                      >
                        <div className="bg-gray-50 hover:bg-purple-50 rounded-lg p-4 transition-all border border-transparent hover:border-purple-200">
                          <div className="flex items-start gap-3">
                            {subcat.category_image && (
                              <div className="relative w-10 h-10 flex-shrink-0">
                                <Image
                                  src={subcat.category_image}
                                  alt={subcat.name}
                                  fill
                                  className="object-cover rounded"
                                  sizes="40px"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm text-gray-900 group-hover:text-purple-900 line-clamp-2 mb-1">
                                {subcat.name}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {subcat.products_count} productos
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    href={`/categoria/${mainCat.slug}`}
                    className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Ver productos
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Todas las demás categorías (si no tienen padre o están en niveles más profundos) */}
        {mainCategories.filter((cat: any) => cat.level_depth > 3).length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Otras categorías</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {mainCategories
                .filter((cat: any) => cat.level_depth > 3)
                .map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/categoria/${cat.slug}`}
                    className="bg-white border rounded-lg p-4 hover:shadow-md transition group"
                  >
                    {cat.category_image && (
                      <div className="relative w-full h-24 mb-3">
                        <Image
                          src={cat.category_image}
                          alt={cat.name}
                          fill
                          className="object-cover rounded"
                          sizes="200px"
                        />
                      </div>
                    )}
                    <h3 className="font-medium text-sm text-gray-900 group-hover:text-purple-900 line-clamp-2 mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {cat.products_count} productos
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
