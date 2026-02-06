'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useSearchAutocomplete, SearchSuggestion } from '@/lib/hooks/useSearchAutocomplete';
import SearchSuggestions from './SearchSuggestions';
import SearchHistory from './SearchHistory';

interface SearchAutocompleteProps {
  className?: string;
}

export default function SearchAutocomplete({ className = '' }: SearchAutocompleteProps) {
  const t = useTranslations();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    setQuery,
    suggestions,
    correction,
    loading,
    isOpen,
    setIsOpen,
    searchHistory,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
    saveToHistory,
    clearHistory,
  } = useSearchAutocomplete({
    debounceMs: 300,
    minChars: 2,
    maxResults: 8,
  });

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  // Manejar selección de sugerencia
  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    saveToHistory(suggestion.name);
    setQuery('');
    setIsOpen(false);
    router.push(`/producto/${suggestion.slug}`);
  };

  // Manejar selección de historial
  const handleSelectHistory = (term: string) => {
    setQuery(term);
    setIsOpen(false);
    router.push(`/buscar?q=${encodeURIComponent(term)}`);
  };

  // Manejar búsqueda con corrección
  const handleSearchWithCorrection = () => {
    if (correction) {
      setQuery(correction);
      saveToHistory(correction);
      router.push(`/buscar?q=${encodeURIComponent(correction)}`);
      setIsOpen(false);
    }
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Si hay un item seleccionado con teclado
    if (selectedIndex >= 0) {
      if (query.length < 2 && searchHistory[selectedIndex]) {
        handleSelectHistory(searchHistory[selectedIndex]);
        return;
      }
      if (suggestions[selectedIndex]) {
        handleSelectSuggestion(suggestions[selectedIndex]);
        return;
      }
    }

    // Búsqueda normal
    if (query.trim().length >= 2) {
      saveToHistory(query);
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setIsOpen(false);
    }
  };

  // Manejar teclas especiales
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleKeyDown(e);

    if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      if (query.length < 2 && searchHistory[selectedIndex]) {
        handleSelectHistory(searchHistory[selectedIndex]);
      } else if (suggestions[selectedIndex]) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      }
    }
  };

  const showDropdown = isOpen && (
    suggestions.length > 0 ||
    (query.length < 2 && searchHistory.length > 0) ||
    correction ||
    loading
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="search"
            placeholder={t('header.searchPlaceholder')}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleInputKeyDown}
            className="w-full px-4 py-2.5 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-purple-900 transition"
            autoComplete="off"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white hover:bg-purple-900 p-1.5 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Dropdown de sugerencias */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[400px] overflow-y-auto">
          {/* Corrección ortográfica */}
          {correction && suggestions.length === 0 && !loading && (
            <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-100">
              <p className="text-sm text-gray-700">
                ¿Quisiste decir{' '}
                <button
                  type="button"
                  onClick={handleSearchWithCorrection}
                  className="text-purple-700 font-semibold hover:underline"
                >
                  {correction}
                </button>
                ?
              </p>
            </div>
          )}

          {/* Historial de búsqueda (cuando no hay query) */}
          {query.length < 2 && searchHistory.length > 0 && (
            <SearchHistory
              history={searchHistory}
              selectedIndex={selectedIndex}
              onSelect={handleSelectHistory}
              onClear={clearHistory}
            />
          )}

          {/* Sugerencias de productos */}
          {query.length >= 2 && (
            <SearchSuggestions
              suggestions={suggestions}
              selectedIndex={selectedIndex}
              onSelect={handleSelectSuggestion}
              loading={loading}
            />
          )}

          {/* Sin resultados */}
          {query.length >= 2 && !loading && suggestions.length === 0 && !correction && (
            <div className="px-4 py-3 text-center text-gray-500 text-sm">
              No se encontraron resultados para &quot;{query}&quot;
            </div>
          )}

          {/* Enlace para ver todos los resultados */}
          {query.length >= 2 && suggestions.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full text-center text-sm text-purple-700 hover:text-purple-900 font-medium"
              >
                Ver todos los resultados para &quot;{query}&quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
