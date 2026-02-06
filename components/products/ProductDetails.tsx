'use client';

import { useState } from 'react';
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
  description?: string;
  short_description?: string;
  stock_status: string;
  quantity?: number;
  reference?: string;
  ean13?: string;
  product_thumbnail?: {
    original_url: string;
  };
}

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const t = useTranslations();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const inStock = product.stock_status === 'in_stock';
  const hasDiscount = product.is_sale_enable && product.discount && product.discount > 0;
  const currentPrice = product.sale_price || product.price;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      addToCart({
        productId: product.id,
        name: product.name,
        price: currentPrice,
        image: product.product_thumbnail?.original_url,
        reference: product.reference,
      }, quantity);

      // Resetear cantidad después de agregar
      setTimeout(() => {
        setIsAdding(false);
      }, 500);
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
        {product.reference && (
          <p className="text-sm text-gray-500">
            {t('product.reference')}: {product.reference}
          </p>
        )}
      </div>

      {/* Rating placeholder */}
      <div className="flex items-center gap-2">
        <div className="flex text-yellow-400 text-lg">
          {'★★★★★'}
        </div>
        <span className="text-sm text-gray-600">(0 reseñas)</span>
      </div>

      {/* Precio */}
      <div className="border-t border-b py-4">
        <div className="flex items-center gap-3">
          {hasDiscount ? (
            <>
              <span className="text-3xl font-bold text-red-600">
                €{currentPrice.toFixed(2)}
              </span>
              <span className="text-xl text-gray-400 line-through">
                €{product.price.toFixed(2)}
              </span>
              <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                -{product.discount}%
              </span>
            </>
          ) : (
            <span className="text-3xl font-bold text-purple-900">
              €{currentPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Stock */}
      <div>
        {inStock ? (
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{t('product.inStock')}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{t('product.outOfStock')}</span>
          </div>
        )}
      </div>

      {/* Cantidad y Añadir al carrito */}
      {inStock && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-900">{t('product.quantity')}:</label>
            <div className="flex items-center border border-gray-300 rounded-lg bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-bold text-lg"
              >
                -
              </button>
              <span className="px-4 py-2 border-x border-gray-300 text-gray-900 font-medium bg-gray-50 min-w-[50px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isAdding}
          >
            {t('common.addToCart')}
          </Button>
        </div>
      )}

      {/* Descripción corta */}
      {product.short_description && (
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: product.short_description }} />
        </div>
      )}

      {/* Información adicional */}
      <div className="border-t pt-4 space-y-2 text-sm">
        {product.ean13 && (
          <div className="flex justify-between">
            <span className="text-gray-600">EAN13:</span>
            <span className="font-medium">{product.ean13}</span>
          </div>
        )}
      </div>
    </div>
  );
}
