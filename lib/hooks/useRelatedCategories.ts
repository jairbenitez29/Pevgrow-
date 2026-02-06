import { useQuery } from '@tanstack/react-query';

/**
 * Hook para obtener subcategorias directas de una categoria
 * Solo muestra hijos directos, NO hermanas (para evitar bucles de navegacion)
 */
export function useRelatedCategories(
  categoryId: number | null | undefined,
  parentId: number | null | undefined,
  levelDepth: number | undefined
) {
  return useQuery({
    queryKey: ['relatedCategories', categoryId, parentId, levelDepth],
    queryFn: async () => {
      // Limite reducido para mejor rendimiento
      const response = await fetch('/api/category?limit=200');

      if (!response.ok) {
        throw new Error('Error al cargar categorias');
      }

      const data = await response.json();
      const allCategories = data.data || [];

      // Solo buscar subcategorias directas (hijos)
      const subcategories = allCategories.filter((cat: any) => {
        const isDirectChild = cat.parent_id === categoryId;
        const isActive = cat.active || cat.active === '1' || cat.active === 1;

        if (levelDepth && levelDepth > 0 && cat.level_depth && cat.level_depth > 0) {
          const isNextLevel = cat.level_depth === levelDepth + 1;
          return isDirectChild && isNextLevel && isActive;
        }

        return isDirectChild && isActive;
      });

      if (subcategories.length > 0) {
        return {
          type: 'subcategories',
          categories: subcategories.sort((a: any, b: any) => a.name.localeCompare(b.name)),
        };
      }

      // Si no hay subcategorias, no mostrar nada
      // (evita el bucle de mostrar hermanas)
      return {
        type: 'none',
        categories: [],
      };
    },
    enabled: !!categoryId,
    // Cache por 10 minutos
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
