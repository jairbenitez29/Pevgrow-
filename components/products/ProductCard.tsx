'use client';

import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCart } from '@/lib/contexts/CartContext';
import Button from '@/components/ui/Button';

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

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations();
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.product_thumbnail?.original_url,
      reference: product.reference,
    }, 1);
  };

  const inStock = product.stock_status === 'in_stock';
  const hasDiscount = product.is_sale_enable && product.discount && product.discount > 0;
  const effectivePrice = product.sale_price || product.price;
  const savings = hasDiscount ? (product.price - (product.sale_price || product.price)) : 0;
  const showFreeShipping = effectivePrice >= 30;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-2xl hover:border-purple-300 hover:-translate-y-1 transition-all duration-300 group">
      <Link href={`/productos/${product.slug}`}>
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.product_thumbnail?.original_url ? (
            <Image
              src={product.product_thumbnail.original_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-xs font-medium">{t('product.noImage')}</span>
            </div>
          )}

          {/* Badges superiores */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasDiscount && (
              <span className="bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
                -{product.discount}%
              </span>
            )}
            {showFreeShipping && inStock && (
              <span className="bg-purple-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
                Envio gratis
              </span>
            )}
          </div>

          {!inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold text-lg">{t('product.outOfStock')}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/productos/${product.slug}`}>
          <h3 className="font-bold text-sm text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem] hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-yellow-400 text-base">
            {'★★★★★'}
          </div>
          <span className="text-xs text-gray-500 font-medium">(0)</span>
        </div>

        <div className="mb-4">
          {hasDiscount ? (
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-gray-900">
                  {product.sale_price?.toFixed(2)} EUR
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {product.price.toFixed(2)} EUR
                </span>
              </div>
              {savings > 0 && (
                <span className="text-xs font-medium text-green-600 mt-0.5">
                  Ahorras {savings.toFixed(2)} EUR
                </span>
              )}
            </div>
          ) : (
            <span className="text-base font-bold text-gray-900">
              {product.price.toFixed(2)} EUR
            </span>
          )}
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={!inStock}
          variant="primary"
          size="sm"
          fullWidth
        >
          {inStock ? t('common.addToCart') : t('product.outOfStock')}
        </Button>
      </div>
    </div>
  );
}
