'use client';

import ProductCard from './ProductCard';
import Loader from '@/components/ui/Loader';
import { useTranslations } from 'next-intl';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  discount?: number;
  is_sale_enable?: boolean;
  product_thumbnail?: {
    original_url: string;
  };
  stock_status: string;
  reference?: string;
}

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4 | 5 | 6;
}

export default function ProductGrid({
  products,
  isLoading = false,
  columns = 4
}: ProductGridProps) {
  const t = useTranslations();

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <Loader size="lg" text={t('common.loading')} />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{t('product.noProducts')}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
