import { useQuery } from '@tanstack/react-query';

/**
 * Hook para obtener categorias
 * El limite se maneja en el servidor para optimizar cache
 */
export function useCategories(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/category');

      if (!response.ok) {
        throw new Error('Error al cargar categorias');
      }

      return response.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hora
  });
}
