import { useQuery } from '@tanstack/react-query';

interface UseProductsParams {
  category?: string | number;
  limit?: number;
  offset?: number;
}

/**
 * Hook para cargar productos con cache optimizado
 */
export function useProducts(params: UseProductsParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params.category) {
        searchParams.append('category', params.category.toString());
      }
      if (params.limit) {
        searchParams.append('limit', params.limit.toString());
      }
      if (params.offset) {
        searchParams.append('offset', params.offset.toString());
      }

      const response = await fetch(`/api/product?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }

      const data = await response.json();
      return data;
    },
    // Siempre ejecutar (con o sin categoria)
    enabled: true,
    // Cache por 5 minutos
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
