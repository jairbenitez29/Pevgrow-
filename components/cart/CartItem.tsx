'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useCart } from '@/lib/contexts/CartContext';

interface CartItemProps {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  combinationId?: number;
  reference?: string;
}

export default function CartItem({
  productId,
  name,
  price,
  quantity,
  image,
  combinationId,
  reference,
}: CartItemProps) {
  const t = useTranslations();
  const { updateQuantity, removeFromCart } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity, combinationId);
    }
  };

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      removeFromCart(productId, combinationId);
    }, 200);
  };

  const itemTotal = price * quantity;

  return (
    <div
      className={`flex gap-4 p-4 bg-white rounded-lg border border-gray-200 transition ${
        isRemoving ? 'opacity-50 scale-95' : ''
      }`}
    >
      {/* Image */}
      <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover rounded"
            sizes="96px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/productos/${reference || productId}`}
          className="text-lg font-medium text-gray-900 hover:text-purple-900 line-clamp-2"
        >
          {name}
        </Link>
        {reference && (
          <p className="text-sm text-gray-500 mt-1">
            {t('product.reference')}: {reference}
          </p>
        )}

        <div className="flex items-center gap-4 mt-3">
          {/* Quantity Selector */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              className="px-3 py-2 hover:bg-gray-100"
            >
              +
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            {t('cart.removeItem')}
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <div className="text-xl font-bold text-purple-900">
          €{itemTotal.toFixed(2)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          €{price.toFixed(2)} x {quantity}
        </div>
      </div>
    </div>
  );
}
