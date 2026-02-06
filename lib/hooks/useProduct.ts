import { useQuery } from '@tanstack/react-query';

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await fetch(`/api/product/${slug}`);

      if (!response.ok) {
        throw new Error('Producto no encontrado');
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!slug,
  });
}
