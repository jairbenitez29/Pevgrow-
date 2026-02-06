'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Loader from '@/components/ui/Loader';

interface Brand {
    id: number;
    name: string;
    slug?: string;
    image?: string;
    products_count?: number;
    type?: string;
}

export default function BrandsPage() {
    const t = useTranslations();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchBrands() {
            try {
                const response = await fetch('/api/brands?limit=100');

                if (!response.ok) {
                    throw new Error('Error al cargar marcas');
                }

                const data = await response.json();

                if (data.success && data.brands) {
                    // Ordenar alfabeticamente
                    const sortedBrands = data.brands.sort((a: Brand, b: Brand) =>
                        a.name.localeCompare(b.name)
                    );
                    setBrands(sortedBrands);
                }
            } catch (error) {
                console.error('Error loading brands:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchBrands();
    }, []);

    // Filtrar marcas por termino de busqueda
    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const breadcrumbItems = [
        {
            label: 'Marcas',
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader size="lg" text={t('common.loading')} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <div className="mb-6">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Nuestras Marcas</h1>
                    <p className="text-gray-600 mb-6">
                        Descubre las mejores marcas del mercado
                    </p>

                    {/* Buscador */}
                    <div className="max-w-md">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar marca..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <svg
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Contador */}
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-gray-600">
                        {filteredBrands.length} {filteredBrands.length === 1 ? 'marca disponible' : 'marcas disponibles'}
                        {searchTerm && ` para "${searchTerm}"`}
                    </p>
                </div>

                {/* Grid de marcas */}
                {filteredBrands.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredBrands.map(brand => (
                            <Link
                                key={brand.id}
                                href={`/marca/${brand.id}`}
                                className="group"
                            >
                                <div className="bg-white rounded-xl border-2 border-gray-100 p-5 text-center hover:border-purple-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col justify-center">
                                    {/* Logo */}
                                    <div className="h-20 flex items-center justify-center mb-4">
                                        {brand.image ? (
                                            <div className="relative w-16 h-16 group-hover:scale-110 transition-transform duration-300">
                                                <Image
                                                    src={brand.image}
                                                    alt={brand.name}
                                                    fill
                                                    className="object-contain"
                                                    sizes="64px"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <span className="text-2xl font-bold text-purple-600">
                                                    {brand.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Nombre */}
                                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 line-clamp-2 mb-1">
                                        {brand.name}
                                    </h3>

                                    {/* Contador de productos */}
                                    {brand.products_count && brand.products_count > 0 && (
                                        <p className="text-xs text-gray-500">
                                            {brand.products_count} productos
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-gray-600 text-lg">
                            {searchTerm
                                ? `No se encontraron marcas para "${searchTerm}"`
                                : 'No hay marcas disponibles'
                            }
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 text-purple-600 hover:text-purple-800 font-medium"
                            >
                                Ver todas las marcas
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
