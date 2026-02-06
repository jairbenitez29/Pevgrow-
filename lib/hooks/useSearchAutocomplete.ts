'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';

export interface SearchSuggestion {
  id: number;
  name: string;
  slug: string;
  image?: string;
  price?: number;
  type: 'product' | 'category' | 'term';
}

export interface SearchResult {
  suggestions: SearchSuggestion[];
  correction?: string;
  loading: boolean;
  error: string | null;
}

interface UseSearchAutocompleteOptions {
  debounceMs?: number;
  minChars?: number;
  maxResults?: number;
}

const SEARCH_HISTORY_KEY = 'pevgrow_search_history';
const MAX_HISTORY_ITEMS = 10;

export function useSearchAutocomplete(options: UseSearchAutocompleteOptions = {}) {
  const {
    debounceMs = 300,
    minChars = 2,
    maxResults = 8
  } = options;

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [correction, setCorrection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debouncedQuery = useDebounce(query, debounceMs);

  // Cargar historial de búsqueda al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (saved) {
        try {
          setSearchHistory(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading search history:', e);
        }
      }
    }
  }, []);

  // Guardar término en historial
  const saveToHistory = useCallback((term: string) => {
    const normalizedTerm = term.trim().toLowerCase();
    if (!normalizedTerm || normalizedTerm.length < minChars) return;

    setSearchHistory(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== normalizedTerm);
      const updated = [term.trim(), ...filtered].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [minChars]);

  // Limpiar historial
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  }, []);

  // Buscar sugerencias
  const fetchSuggestions = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < minChars) {
      setSuggestions([]);
      setCorrection(null);
      return;
    }

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchTerm)}&limit=${maxResults}`,
        { signal: abortControllerRef.current.signal }
      );

      if (!response.ok) {
        throw new Error('Error fetching suggestions');
      }

      const data = await response.json();

      setSuggestions(data.suggestions || []);
      setCorrection(data.correction || null);
      setSelectedIndex(-1);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Ignorar errores de cancelación
      }
      console.error('Search error:', err);
      setError('Error en la búsqueda');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [minChars, maxResults]);

  // Efecto para buscar cuando cambia el query debounced
  useEffect(() => {
    if (debouncedQuery) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
      setCorrection(null);
    }
  }, [debouncedQuery, fetchSuggestions]);

  // Manejar navegación con teclado
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalItems = suggestions.length + (query.length < minChars ? searchHistory.length : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
        }
        break;
    }
  }, [suggestions.length, searchHistory.length, query.length, minChars]);

  // Obtener item seleccionado
  const getSelectedItem = useCallback(() => {
    if (selectedIndex < 0) return null;

    if (query.length < minChars) {
      return searchHistory[selectedIndex] ? { term: searchHistory[selectedIndex] } : null;
    }

    return suggestions[selectedIndex] || null;
  }, [selectedIndex, query.length, minChars, searchHistory, suggestions]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    correction,
    loading,
    error,
    isOpen,
    setIsOpen,
    searchHistory,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
    getSelectedItem,
    saveToHistory,
    clearHistory,
  };
}
