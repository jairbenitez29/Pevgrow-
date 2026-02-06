'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import type { SearchSuggestion } from '@/lib/hooks/useSearchAutocomplete';

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  selectedIndex: number;
  onSelect: (suggestion: SearchSuggestion) => void;
  loading?: boolean;
}

export default function SearchSuggestions({
  suggestions,
  selectedIndex,
  onSelect,
  loading = false
}: SearchSuggestionsProps) {
  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-purple-900 border-t-transparent"></div>
        <span className="ml-2">Buscando...</span>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <ul className="py-2">
      {suggestions.map((suggestion, index) => (
        <li key={`${suggestion.type}-${suggestion.id}`}>
          <button
            type="button"
            onClick={() => onSelect(suggestion)}
            className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-purple-50 transition ${
              index === selectedIndex ? 'bg-purple-50' : ''
            }`}
          >
            {/* Imagen del producto */}
            {suggestion.image ? (
              <div className="w-10 h-10 relative flex-shrink-0 bg-gray-100 rounded">
                <Image
                  src={suggestion.image}
                  alt={suggestion.name}
                  fill
                  className="object-contain rounded"
                  sizes="40px"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Información del producto */}
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {suggestion.name}
              </p>
              {suggestion.price !== undefined && (
                <p className="text-sm text-purple-900 font-semibold">
                  {suggestion.price.toFixed(2)} €
                </p>
              )}
            </div>

            {/* Indicador de tipo */}
            {suggestion.type === 'category' && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                Categoría
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
