'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useParams } from 'next/navigation';

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  category_image?: string;
  products_count: number;
}

interface SubcategoriesGridProps {
  subcategories: Subcategory[];
}

export default function SubcategoriesGrid({ subcategories }: SubcategoriesGridProps) {
  const params = useParams();
  const locale = params?.locale as string || 'es';

  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Subcategorías</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {subcategories.map((subcategory) => (
          <Link
            key={subcategory.id}
            href={`/${locale}/categoria/${subcategory.slug}`}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 text-center">
              {/* Imagen de categoría */}
              {subcategory.category_image ? (
                <div className="relative w-full h-24 mb-3">
                  <Image
                    src={subcategory.category_image}
                    alt={subcategory.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                </div>
              ) : (
                <div className="w-full h-24 mb-3 bg-gray-100 rounded flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              )}

              {/* Nombre */}
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-purple-900 line-clamp-2 mb-1">
                {subcategory.name}
              </h3>

              {/* Contador de productos */}
              {subcategory.products_count > 0 && (
                <p className="text-xs text-gray-500">
                  {subcategory.products_count} {subcategory.products_count === 1 ? 'producto' : 'productos'}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
