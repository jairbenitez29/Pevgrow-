import { useQuery } from '@tanstack/react-query';

export function useSubcategories(parentId: number | null | undefined, parentLevelDepth?: number) {
  return useQuery({
    queryKey: ['subcategories', parentId, parentLevelDepth],
    queryFn: async () => {
      // Obtener todas las categorías (límite optimizado para balance rendimiento/cobertura)
      const response = await fetch('/api/category?limit=3000');

      if (!response.ok) {
        throw new Error('Error al cargar categorías');
      }

      const data = await response.json();
      const allCategories = data.data || [];

      // Encontrar la categoría padre para obtener su level_depth si no se proporciona
      let actualLevelDepth = parentLevelDepth;
      if (actualLevelDepth === undefined) {
        const parentCategory = allCategories.find((cat: any) => cat.id === parentId);
        actualLevelDepth = parentCategory?.level_depth ?? 0;
      }

      // Filtrar solo las categorías hijas DIRECTAS
      // Si level_depth está disponible, usarlo para filtrar más precisamente
      // Si no, usar solo parent_id
      const subcategories = allCategories.filter((cat: any) => {
        const isDirectChild = cat.parent_id === parentId;
        const isActive = cat.active || cat.active === '1' || cat.active === 1;

        // Si tanto la categoría como el padre tienen level_depth válido, verificar nivel
        if (actualLevelDepth && actualLevelDepth > 0 && cat.level_depth && cat.level_depth > 0) {
          const isNextLevel = cat.level_depth === actualLevelDepth + 1;
          return isDirectChild && isNextLevel && isActive;
        }

        // Fallback: solo verificar parent_id y activo
        return isDirectChild && isActive;
      });

      // Ordenar por nombre
      return subcategories.sort((a: any, b: any) => a.name.localeCompare(b.name));
    },
    enabled: !!parentId,
  });
}
