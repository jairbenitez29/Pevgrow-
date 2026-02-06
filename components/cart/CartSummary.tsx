'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useCart } from '@/lib/contexts/CartContext';
import Button from '@/components/ui/Button';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
}

export default function CartSummary({ showCheckoutButton = true }: CartSummaryProps) {
  const t = useTranslations();
  const { total, itemCount } = useCart();

  const shipping = total >= 30 ? 0 : 5.95;
  const grandTotal = total + shipping;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {t('cart.cartSummary')}
      </h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>{t('common.subtotal')}</span>
          <span>€{total.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>{t('common.shipping')}</span>
          <span>
            {shipping === 0 ? (
              <span className="text-green-600 font-medium">
                {t('header.freeShipping').includes('GRATIS') ? 'GRATIS' : 'FREE'}
              </span>
            ) : (
              `€${shipping.toFixed(2)}`
            )}
          </span>
        </div>

        {total > 0 && total < 30 && (
          <p className="text-sm text-gray-500 bg-yellow-50 p-3 rounded">
            Añade €{(30 - total).toFixed(2)} más para envío gratis
          </p>
        )}

        <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
          <span>{t('common.total')}</span>
          <span className="text-purple-900">€{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {showCheckoutButton && (
        <div className="space-y-3">
          <Link href="/checkout">
            <Button variant="primary" size="lg" fullWidth>
              {t('cart.proceedToCheckout')}
            </Button>
          </Link>
          <Link href="/productos">
            <Button variant="outline" size="md" fullWidth>
              {t('cart.continueShopping')}
            </Button>
          </Link>
        </div>
      )}

      {/* Trust badges */}
      <div className="mt-6 pt-6 border-t space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Pago seguro</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
          <span>Envío rápido y discreto</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Calidad garantizada</span>
        </div>
      </div>
    </div>
  );
}
