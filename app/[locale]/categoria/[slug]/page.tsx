'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCategory } from '@/lib/hooks/useCategory';
import { useProducts } from '@/lib/hooks/useProducts';
import { useRelatedCategories } from '@/lib/hooks/useRelatedCategories';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSort, { type SortOption } from '@/components/products/ProductSort';
import ProductPagination from '@/components/products/ProductPagination';
import SubcategoriesGrid from '@/components/category/SubcategoriesGrid';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Loader from '@/components/ui/Loader';

interface CategoryPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const t = useTranslations();
  const [locale, setLocale] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<any>({});

  const itemsPerPage = 24;

  // Unwrap params
  useEffect(() => {
    params.then((p) => {
      setLocale(p.locale);
      setSlug(p.slug);
    });
  }, [params]);

  // Fetch category - SIEMPRE llamar hooks antes de early returns
  const { data: category, isLoading: categoryLoading } = useCategory(slug);

  // Fetch subcategorias directas
  const { data: relatedData } = useRelatedCategories(
    category?.id,
    category?.parent_id,
    category?.level_depth
  );
  const relatedCategories = relatedData?.categories || [];

  // Fetch products for this category - limite optimizado
  const { data: productsData, isLoading: productsLoading } = useProducts({
    category: category?.id,
    limit: 48, // 2 paginas de productos (24 por pagina)
  });

  // Reset to page 1 when filters change - MOVER ANTES DE EARLY RETURNS
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  // EARLY RETURNS DESPUÉS DE TODOS LOS HOOKS
  if (!slug) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" text={t('common.loading')} />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Categoría no encontrada
          </h1>
          <p className="text-gray-600">
            La categoría que buscas no existe
          </p>
        </div>
      </div>
    );
  }

  const products = productsData?.data || [];

  // Apply filters
  let filteredProducts = [...products];

  // Filter by stock
  if (filters.inStockOnly) {
    filteredProducts = filteredProducts.filter((p: any) => p.stock_status === 'in_stock');
  }

  // Filter by price
  if (filters.minPrice !== undefined) {
    filteredProducts = filteredProducts.filter((p: any) => {
      const price = p.sale_price || p.price;
      return price >= filters.minPrice;
    });
  }

  if (filters.maxPrice !== undefined) {
    filteredProducts = filteredProducts.filter((p: any) => {
      const price = p.sale_price || p.price;
      return price <= filters.maxPrice;
    });
  }

  // Filter by brands
  if (filters.brands && filters.brands.length > 0) {
    filteredProducts = filteredProducts.filter((p: any) =>
      p.manufacturer_id && filters.brands.includes(p.manufacturer_id)
    );
  }

  // Apply sorting
  filteredProducts.sort((a: any, b: any) => {
    const aPrice = a.sale_price || a.price;
    const bPrice = b.sale_price || b.price;

    switch (sortBy) {
      case 'price-asc':
        return aPrice - bPrice;
      case 'price-desc':
        return bPrice - aPrice;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'newest':
        return b.id - a.id; // Assuming higher ID = newer
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Extract unique brands from products
  const brands = products
    .filter((p: any) => p.manufacturer_name)
    .reduce((acc: any[], product: any) => {
      if (!acc.find((b) => b.id === product.manufacturer_id)) {
        acc.push({
          id: product.manufacturer_id,
          name: product.manufacturer_name,
        });
      }
      return acc;
    }, [])
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  // Breadcrumb items (Breadcrumbs component ya agrega "Inicio" automáticamente)
  const breadcrumbItems = [
    {
      label: t('common.categories'),
      href: `/${locale}/categorias`,
    },
    {
      label: category.name,
      // No incluir href en el último item para que no sea clickable
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          {category.description && (
            <div
              className="text-gray-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: category.description }}
            />
          )}
        </div>

        {/* Subcategorias */}
        {relatedCategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Subcategorías</h2>
            <SubcategoriesGrid subcategories={relatedCategories} />
          </div>
        )}

        {/* Seccion de productos - siempre visible */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters onFilterChange={setFilters} brands={brands} />
          </div>

          {/* Products Area */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-gray-600">
                {productsLoading ? (
                  'Cargando productos...'
                ) : (
                  `Mostrando ${filteredProducts.length > 0 ? startIndex + 1 : 0}-${Math.min(startIndex + itemsPerPage, filteredProducts.length)} de ${filteredProducts.length} productos`
                )}
              </div>
              <ProductSort value={sortBy} onChange={setSortBy} />
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="flex justify-center py-12">
                <Loader size="lg" text={t('common.loading')} />
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <ProductGrid products={paginatedProducts} columns={3} />
                <ProductPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-gray-600 mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-lg font-medium">{t('product.noProducts')}</p>
                  {relatedCategories.length > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Explora las subcategorias de arriba para encontrar productos
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
