import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';
import { expandWithSynonyms } from '@/lib/search/synonyms';
import { suggestCorrections, SEARCH_DICTIONARY } from '@/lib/search/levenshtein';

interface Suggestion {
  id: number;
  name: string;
  slug: string;
  image?: string;
  price?: number;
  type: 'product' | 'category' | 'term';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '8');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        suggestions: [],
        correction: null,
        message: 'La búsqueda debe tener al menos 2 caracteres'
      });
    }

    const normalizedQuery = query.trim().toLowerCase();
    const suggestions: Suggestion[] = [];

    // 1. Expandir búsqueda con sinónimos
    const expandedTerms = expandWithSynonyms(normalizedQuery);

    // 2. Buscar productos usando el término original y sinónimos
    const searchPromises = expandedTerms.slice(0, 3).map(term =>
      PrestaShopService.searchProducts(term, { limit: Math.ceil(limit / 2) })
        .catch(() => [])
    );

    const searchResults = await Promise.all(searchPromises);
    const allProducts = searchResults.flat();

    // Eliminar duplicados por ID
    const uniqueProducts = new Map();
    for (const product of allProducts) {
      if (!uniqueProducts.has(product.id)) {
        uniqueProducts.set(product.id, product);
      }
    }

    // Transformar y agregar productos a sugerencias
    const transformedProducts = PrestaShopTransformer.transformProducts(
      Array.from(uniqueProducts.values())
    );

    for (const product of transformedProducts.slice(0, limit)) {
      suggestions.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: product.price,
        type: 'product'
      });
    }

    // 3. Verificar si necesitamos corrección ortográfica
    let correction: string | null = null;

    if (suggestions.length === 0) {
      // No hay resultados, intentar corrección
      correction = suggestCorrections(normalizedQuery, SEARCH_DICTIONARY);

      // Si hay corrección, buscar con el término corregido
      if (correction) {
        try {
          const correctedProducts = await PrestaShopService.searchProducts(correction, {
            limit: limit
          });

          const transformedCorrected = PrestaShopTransformer.transformProducts(correctedProducts);

          for (const product of transformedCorrected.slice(0, limit)) {
            suggestions.push({
              id: product.id,
              name: product.name,
              slug: product.slug,
              image: product.image,
              price: product.price,
              type: 'product'
            });
          }
        } catch (e) {
          console.error('Error searching with correction:', e);
        }
      }
    }

    return NextResponse.json({
      suggestions: suggestions.slice(0, limit),
      correction: suggestions.length === 0 ? null : correction,
      query: query,
      expandedTerms: expandedTerms,
    });
  } catch (error: any) {
    console.error('Error en sugerencias de búsqueda:', error);

    return NextResponse.json({
      suggestions: [],
      correction: null,
      error: error.message,
    }, { status: 500 });
  }
}
