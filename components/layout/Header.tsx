'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import Image from 'next/image';
import { useAuth } from '@/lib/contexts/AuthContext';
import MiniCart from '@/components/cart/MiniCart';
import SearchAutocomplete from '@/components/search/SearchAutocomplete';

const LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
];

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Barra superior púrpura con ofertas */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 text-white py-2.5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              <span>{t('header.freeShipping')}</span>
            </div>
            <div className="hidden sm:block text-yellow-300">|</div>
            <div className="hidden sm:flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-yellow-300">{t('header.discount')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header principal */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/api/prestashop/images/general/header"
              alt="Pevgrow"
              width={220}
              height={60}
              priority
              className="h-12 w-auto md:h-14"
            />
          </Link>

          {/* Buscador con Autocomplete */}
          <SearchAutocomplete className="flex-1 max-w-2xl" />

          {/* Idioma, Usuario y Carrito */}
          <div className="flex items-center gap-4">
            {/* Selector de idioma */}
            <select
              value={locale}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:border-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-purple-900 transition cursor-pointer bg-white"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.code.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Usuario */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-purple-50 rounded-lg transition group"
                  >
                    <svg className="w-6 h-6 text-purple-900 group-hover:text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>

                  {/* User Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstname} {user.lastname}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/cuenta/perfil"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {t('account.myAccount')}
                      </Link>
                      <Link
                        href="/cuenta/pedidos"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {t('account.orders')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        {t('common.logout')}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 p-2 hover:bg-purple-50 rounded-lg transition group"
                >
                  <svg className="w-6 h-6 text-purple-900 group-hover:text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Carrito */}
            <MiniCart />
          </div>
        </div>
      </div>

      {/* Navegacion */}
      <nav className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <ul className="flex justify-center gap-1 py-2 text-sm overflow-x-auto scrollbar-hide">
            <li>
              <Link href="/productos" className="text-gray-700 hover:text-gray-900 hover:bg-gray-200 font-medium whitespace-nowrap px-4 py-2 rounded-lg transition-all">
                {t('common.products')}
              </Link>
            </li>
            <li>
              <Link href="/categoria/semillas-feminizadas" className="text-gray-700 hover:text-gray-900 hover:bg-gray-200 font-medium whitespace-nowrap px-4 py-2 rounded-lg transition-all">
                {t('categories.feminizedSeeds')}
              </Link>
            </li>
            <li>
              <Link href="/categoria/semillas-autoflorecientes" className="text-gray-700 hover:text-gray-900 hover:bg-gray-200 font-medium whitespace-nowrap px-4 py-2 rounded-lg transition-all">
                {t('categories.autofloweringSeeds')}
              </Link>
            </li>
            <li>
              <Link href="/categoria/cbd-shop" className="text-gray-700 hover:text-gray-900 hover:bg-gray-200 font-medium whitespace-nowrap px-4 py-2 rounded-lg transition-all">
                {t('categories.cbdShop')}
              </Link>
            </li>
            <li>
              <Link href="/categoria/grow-shop" className="text-gray-700 hover:text-gray-900 hover:bg-gray-200 font-medium whitespace-nowrap px-4 py-2 rounded-lg transition-all">
                {t('categories.growShop')}
              </Link>
            </li>
            <li>
              <Link href="/categoria/head-shop" className="text-gray-700 hover:text-gray-900 hover:bg-gray-200 font-medium whitespace-nowrap px-4 py-2 rounded-lg transition-all">
                {t('categories.headShop')}
              </Link>
            </li>
            <li>
              <Link href="/categoria/vape-shop" className="text-gray-700 hover:text-gray-900 hover:bg-gray-200 font-medium whitespace-nowrap px-4 py-2 rounded-lg transition-all">
                {t('categories.vapeShop')}
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
