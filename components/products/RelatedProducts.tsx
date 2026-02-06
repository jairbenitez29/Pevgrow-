'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import ProductGrid from './ProductGrid';

interface RelatedProductsProps {
  categoryId: number;
  currentProductId: number;
  limit?: number;
}

/**
 * Componente de productos relacionados
 * Carga del lado del cliente para no bloquear SSR
 */
export default function RelatedProducts({
  categoryId,
  currentProductId,
  limit = 8
}: RelatedProductsProps) {
  const t = useTranslations();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        const response = await fetch(`/api/product?category=${categoryId}&limit=${limit + 1}`);

        if (!response.ok) {
          throw new Error('Error fetching related products');
        }

        const data = await response.json();

        // Filtrar el producto actual
        const filtered = (data.data || [])
          .filter((p: any) => p.id !== currentProductId)
          .slice(0, limit);

        setProducts(filtered);
      } catch (error) {
        console.error('Error loading related products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (categoryId) {
      fetchRelatedProducts();
    } else {
      setLoading(false);
    }
  }, [categoryId, currentProductId, limit]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t('product.relatedProducts')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48 mb-3"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t('product.relatedProducts')}
      </h2>
      <ProductGrid products={products} columns={4} />
    </div>
  );
}
