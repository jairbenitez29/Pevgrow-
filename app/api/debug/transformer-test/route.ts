import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';

/**
 * Debug: Ver qué devuelve el transformer
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categoryId = parseInt(searchParams.get('category') || '10');

    try {
        // Cargar productos
        const psProducts = await PrestaShopService.getProducts({ limit: 10 });

        // Transformar
        const products = PrestaShopTransformer.transformProducts(psProducts);

        // Filtrar por categoria
        const filtered = products.filter((product: any) => {
            if (product.categories && Array.isArray(product.categories)) {
                return product.categories.some((cat: any) => {
                    const catId = typeof cat.id === 'string' ? parseInt(cat.id) : cat.id;
                    return catId === categoryId;
                });
            }
            return false;
        });

        return NextResponse.json({
            categoryId,
            totalProducts: products.length,
            filteredCount: filtered.length,
            sampleProduct: products[0] ? {
                id: products[0].id,
                name: products[0].name,
                id_category_default: products[0].id_category_default,
                categories: products[0].categories,
                categoriesCount: products[0].categories?.length || 0,
            } : null,
            filteredSample: filtered[0] ? {
                id: filtered[0].id,
                name: filtered[0].name,
                categories: filtered[0].categories,
            } : null,
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
        }, { status: 500 });
    }
}
