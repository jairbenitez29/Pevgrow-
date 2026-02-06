'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useCart } from '@/lib/contexts/CartContext';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Button from '@/components/ui/Button';

interface CartPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default function CartPage({ params }: CartPageProps) {
  const t = useTranslations();
  const { items, itemCount, clearCart } = useCart();
  const [locale, setLocale] = useState<string>('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Unwrap params
  useEffect(() => {
    params.then((p) => {
      setLocale(p.locale);
    });
  }, [params]);

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: t('cart.title'),
      href: `/${locale}/carrito`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('cart.title')} {itemCount > 0 && `(${itemCount} ${itemCount === 1 ? t('cart.item') : t('cart.items')})`}
          </h1>
          {items.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Vaciar carrito
            </button>
          )}
        </div>

        {/* Clear Cart Confirmation */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¿Vaciar carrito?
              </h3>
              <p className="text-gray-600 mb-6">
                Se eliminarán todos los productos del carrito. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowClearConfirm(false)}
                  variant="outline"
                  size="md"
                  fullWidth
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleClearCart}
                  variant="danger"
                  size="md"
                  fullWidth
                >
                  Vaciar
                </Button>
              </div>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t('cart.empty')}
            </h3>
            <p className="text-gray-600 mb-6">
              Añade productos para continuar comprando
            </p>
            <Link href="/productos">
              <Button variant="primary" size="lg">
                {t('cart.continueShopping')}
              </Button>
            </Link>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItem
                  key={`${item.productId}-${item.combinationId || 0}`}
                  {...item}
                />
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <CartSummary />
            </div>
          </div>
        )}

        {/* Trust Section */}
        {items.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              ¿Por qué comprar en Pevgrow?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-900" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Calidad Premium</h3>
                <p className="text-sm text-gray-600">
                  Productos seleccionados de las mejores marcas
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Envío Rápido</h3>
                <p className="text-sm text-gray-600">
                  Entrega en 24-48h en península
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-900" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Compra Segura</h3>
                <p className="text-sm text-gray-600">
                  Pago 100% seguro y protegido
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
