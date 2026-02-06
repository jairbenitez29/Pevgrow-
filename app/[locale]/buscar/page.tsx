'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useSearch } from '@/lib/hooks/useSearch';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSort, { type SortOption } from '@/components/products/ProductSort';
import ProductPagination from '@/components/products/ProductPagination';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Loader from '@/components/ui/Loader';

interface SearchPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default function SearchPage({ params }: SearchPageProps) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [locale, setLocale] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<any>({});

  const itemsPerPage = 24;

  // Unwrap params
  useEffect(() => {
    params.then((p) => {
      setLocale(p.locale);
    });
  }, [params]);

  // Fetch search results
  const { data: searchData, isLoading } = useSearch({ query, limit: 100 });

  const products = searchData || [];

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
        return b.id - a.id;
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, query]);

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

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: t('common.search'),
      href: `/${locale}/buscar`,
    },
  ];

  if (query) {
    breadcrumbItems.push({
      label: query,
      href: `/${locale}/buscar?q=${encodeURIComponent(query)}`,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {query ? (
              <>
                Resultados para: <span className="text-purple-900">"{query}"</span>
              </>
            ) : (
              'Búsqueda de productos'
            )}
          </h1>
          {query && products.length > 0 && (
            <p className="text-gray-600">
              {products.length} {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}
            </p>
          )}
        </div>

        {!query ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Introduce un término de búsqueda
            </h3>
            <p className="text-gray-600">
              Usa el buscador del header para encontrar productos
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" text={t('common.loading')} />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-gray-600">
              Intenta con otros términos de búsqueda
            </p>
          </div>
        ) : (
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
                  Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} de {filteredProducts.length} productos
                </div>
                <ProductSort value={sortBy} onChange={setSortBy} />
              </div>

              {/* Products Grid */}
              {paginatedProducts.length > 0 ? (
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
                  <p className="text-gray-600">
                    No se encontraron productos con los filtros seleccionados
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
