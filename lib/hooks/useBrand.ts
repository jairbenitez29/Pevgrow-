import { useQuery } from '@tanstack/react-query';

interface Brand {
    id: number;
    name: string;
    slug?: string;
    image?: string;
    description?: string;
    type: 'manufacturer' | 'category';
    products_count?: number;
}

/**
 * Hook para cargar una marca por ID
 * Primero busca en la lista de marcas para determinar el tipo
 */
export function useBrand(brandId: string | number | null | undefined) {
    return useQuery({
        queryKey: ['brand', brandId],
        queryFn: async (): Promise<Brand | null> => {
            // Obtener lista de marcas para encontrar el tipo
            const brandsResponse = await fetch('/api/brands?limit=100');

            if (!brandsResponse.ok) {
                throw new Error('Error al cargar marcas');
            }

            const brandsData = await brandsResponse.json();
            const brands = brandsData.brands || [];

            // Buscar la marca por ID
            const brand = brands.find((b: any) => b.id === parseInt(String(brandId)));

            if (brand) {
                return brand;
            }

            // Si no se encuentra, intentar como categoria
            const categoryResponse = await fetch(`/api/category?limit=200`);
            if (categoryResponse.ok) {
                const categoryData = await categoryResponse.json();
                const categories = categoryData.data || [];
                const category = categories.find((c: any) => c.id === parseInt(String(brandId)));

                if (category) {
                    return {
                        id: category.id,
                        name: category.name,
                        slug: category.slug,
                        image: category.category_image,
                        description: category.description,
                        type: 'category' as const,
                        products_count: category.products_count,
                    };
                }
            }

            return null;
        },
        enabled: !!brandId,
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    });
}

/**
 * Hook para cargar productos de una marca
 * Usa el endpoint correcto segun el tipo de marca
 */
export function useBrandProducts(
    brandId: string | number | null | undefined,
    brandType: 'manufacturer' | 'category' | undefined,
    limit: number = 48
) {
    return useQuery({
        queryKey: ['brandProducts', brandId, brandType, limit],
        queryFn: async () => {
            // Si es categoria, usar endpoint de productos por categoria
            if (brandType === 'category') {
                const response = await fetch(`/api/product?category=${brandId}&limit=${limit}`);

                if (!response.ok) {
                    throw new Error('Error al cargar productos');
                }

                return await response.json();
            }

            // Si es manufacturer, usar endpoint de productos por marca
            const response = await fetch(`/api/brands/${brandId}/products?limit=${limit}`);

            if (!response.ok) {
                throw new Error('Error al cargar productos de la marca');
            }

            return await response.json();
        },
        enabled: !!brandId && !!brandType,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}
