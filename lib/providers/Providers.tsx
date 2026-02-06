'use client';

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { CartProvider } from '@/lib/contexts/CartContext';

interface ProvidersProps {
  children: ReactNode;
  locale: string;
  messages: any;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Europe/Madrid"
    >
      <QueryProvider>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
