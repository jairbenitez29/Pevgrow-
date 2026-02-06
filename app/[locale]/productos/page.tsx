'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSort, { type SortOption } from '@/components/products/ProductSort';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Loader from '@/components/ui/Loader';

interface ProductsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default function ProductsPage({ params }: ProductsPageProps) {
  const t = useTranslations();
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

  // Fetch products con paginacion real desde el servidor
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['allProducts', currentPage, itemsPerPage],
    queryFn: async () => {
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await fetch(`/api/product?limit=${itemsPerPage}&offset=${offset}`);

      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const products = productsData?.data || [];
  const hasMore = productsData?.hasMore ?? false;

  // Apply local filters
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
        return (a.name || '').localeCompare(b.name || '');
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '');
      case 'newest':
        return b.id - a.id;
      default:
        return 0;
    }
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: t('common.products'),
    },
  ];

  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Todos los Productos
          </h1>
          <p className="text-gray-600">
            Descubre nuestra amplia seleccion de productos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters onFilterChange={setFilters} brands={[]} />
          </div>

          {/* Products Area */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-gray-600">
                {isLoading ? (
                  'Cargando productos...'
                ) : (
                  `Pagina ${currentPage} - Mostrando ${filteredProducts.length} productos`
                )}
              </div>
              <ProductSort value={sortBy} onChange={setSortBy} />
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader size="lg" text={t('common.loading')} />
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <ProductGrid products={filteredProducts} columns={3} />

                {/* Paginacion */}
                <div className="mt-8 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  <span className="px-4 py-2 text-sm text-gray-600">
                    Pagina {currentPage}
                  </span>

                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={!hasMore && filteredProducts.length < itemsPerPage}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600">{t('product.noProducts')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
