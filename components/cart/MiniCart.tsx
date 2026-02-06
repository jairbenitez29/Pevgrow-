'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useCart } from '@/lib/contexts/CartContext';
import Button from '@/components/ui/Button';

export default function MiniCart() {
  const t = useTranslations();
  const { items, itemCount, total, removeFromCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-purple-50 rounded-lg transition group"
      >
        <svg className="w-6 h-6 text-purple-900 group-hover:text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-purple-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg">
            {itemCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">
              {t('cart.title')} ({itemCount} {itemCount === 1 ? t('cart.item') : t('cart.items')})
            </h3>
          </div>

          {/* Items */}
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">{t('cart.empty')}</p>
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.combinationId || 0}`} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex gap-3">
                      {/* Image */}
                      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </h4>
                        {item.reference && (
                          <p className="text-xs text-gray-500">
                            Ref: {item.reference}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-gray-600">
                            {item.quantity} x €{item.price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.productId, item.combinationId)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            {t('cart.removeItem')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-900">{t('common.total')}:</span>
                  <span className="font-bold text-xl text-purple-900">
                    €{total.toFixed(2)}
                  </span>
                </div>
                <Link href="/carrito" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" size="md" fullWidth>
                    {t('cart.proceedToCheckout')}
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
