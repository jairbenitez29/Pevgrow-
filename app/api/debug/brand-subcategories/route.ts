import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';

/**
 * Debug: Ver subcategorías de una marca y sus productos
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const brandId = parseInt(searchParams.get('id') || '0');

    if (!brandId) {
        return NextResponse.json({
            error: 'Se requiere parametro id',
            ejemplo: '/api/debug/brand-subcategories?id=2480'
        }, { status: 400 });
    }

    try {
        // Obtener todas las categorías
        const psCategories = await PrestaShopService.getCategories({ limit: 500 });

        let categories: any[] = [];
        if (psCategories?.categories?.category) {
            categories = Array.isArray(psCategories.categories.category)
                ? psCategories.categories.category
                : [psCategories.categories.category];
        } else if (psCategories?.categories && Array.isArray(psCategories.categories)) {
            categories = psCategories.categories;
        }

        // Buscar la categoría marca
        const brandCategory = categories.find((c: any) => parseInt(c.id) === brandId);

        // Buscar subcategorías de esta marca
        const subcategories = categories.filter((c: any) => parseInt(c.id_parent) === brandId);

        // Para cada subcategoría, obtener sus productos
        const subcategoriesWithProducts = [];
        let totalProductsInSubcategories = 0;

        for (const subcat of subcategories.slice(0, 10)) { // Limitar a 10 subcategorías
            const productIds = await PrestaShopService.getProductIdsByCategory(parseInt(subcat.id));
            totalProductsInSubcategories += productIds.length;

            subcategoriesWithProducts.push({
                id: subcat.id,
                name: subcat.name?.language?.[0]?.value || subcat.name,
                productCount: productIds.length,
                productIdsSample: productIds.slice(0, 5),
            });
        }

        // También obtener productos directos de la marca
        const directProductIds = await PrestaShopService.getProductIdsByCategory(brandId);

        return NextResponse.json({
            marca: {
                id: brandCategory?.id,
                name: brandCategory?.name?.language?.[0]?.value || brandCategory?.name,
                nb_products_recursive: brandCategory?.nb_products_recursive,
            },
            productosDirectos: directProductIds.length,
            subcategorias: {
                total: subcategories.length,
                conProductos: subcategoriesWithProducts.filter(s => s.productCount > 0).length,
                totalProductosEnSubcategorias: totalProductsInSubcategories,
                lista: subcategoriesWithProducts,
            },
            recomendacion: totalProductsInSubcategories > 0
                ? 'Los productos están en subcategorías. Necesitamos buscar recursivamente.'
                : directProductIds.length > 0
                    ? 'Los productos están directamente en la marca.'
                    : 'No se encontraron productos. Puede que estén asociados de otra forma.',
        });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
        }, { status: 500 });
    }
}
