import { useQuery } from '@tanstack/react-query';

/**
 * Hook para cargar una categoria por slug
 */
export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const response = await fetch(`/api/category/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Error al cargar categoria');
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!slug,
    retry: false,
    // Cache por 10 minutos (categorias cambian poco)
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
