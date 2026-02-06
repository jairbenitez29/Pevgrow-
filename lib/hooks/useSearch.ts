import { useQuery } from '@tanstack/react-query';

interface UseSearchParams {
  query: string;
  limit?: number;
}

export function useSearch({ query, limit = 50 }: UseSearchParams) {
  return useQuery({
    queryKey: ['search', query, limit],
    queryFn: async () => {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const searchParams = new URLSearchParams();
      searchParams.append('q', query);
      searchParams.append('limit', limit.toString());

      const response = await fetch(`/api/search?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error('Error en la búsqueda');
      }

      const data = await response.json();
      return data.data || [];
    },
    enabled: query.trim().length >= 2,
  });
}
