'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useBrand, useBrandProducts } from '@/lib/hooks/useBrand';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSort, { type SortOption } from '@/components/products/ProductSort';
import ProductPagination from '@/components/products/ProductPagination';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Loader from '@/components/ui/Loader';

interface BrandPageProps {
    params: Promise<{
        locale: string;
        id: string;
    }>;
}

export default function BrandPage({ params }: BrandPageProps) {
    const t = useTranslations();
    const [locale, setLocale] = useState<string>('');
    const [brandId, setBrandId] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [filters, setFilters] = useState<any>({});

    const itemsPerPage = 24;

    // Unwrap params
    useEffect(() => {
        params.then((p) => {
            setLocale(p.locale);
            setBrandId(p.id);
        });
    }, [params]);

    // Fetch brand info
    const { data: brand, isLoading: brandLoading } = useBrand(brandId);

    // Fetch products - usa el tipo de marca para elegir el endpoint correcto
    const { data: productsData, isLoading: productsLoading } = useBrandProducts(
        brandId,
        brand?.type,
        100
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, sortBy]);

    if (!brandId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (brandLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader size="lg" text={t('common.loading')} />
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Marca no encontrada
                    </h1>
                    <p className="text-gray-600">
                        La marca que buscas no existe
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

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    // Breadcrumb items
    const breadcrumbItems = [
        {
            label: 'Marcas',
            href: `/${locale}/marcas`,
        },
        {
            label: brand.name,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <div className="mb-6">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                {/* Brand Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{brand.name}</h1>
                    {brand.description && (
                        <div
                            className="text-gray-600 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: brand.description }}
                        />
                    )}
                </div>

                {/* Products Section */}
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
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
