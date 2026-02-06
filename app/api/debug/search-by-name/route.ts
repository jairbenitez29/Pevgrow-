import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';

/**
 * Debug: Buscar productos por nombre
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q') || '';

    if (!searchTerm) {
        return NextResponse.json({
            error: 'Se requiere parametro q',
            ejemplo: '/api/debug/search-by-name?q=Sweet'
        }, { status: 400 });
    }

    try {
        // Cargar más productos para buscar
        const psProducts = await PrestaShopService.getProducts({ limit: 500 });
        const products = PrestaShopTransformer.transformProducts(psProducts);

        // Buscar productos que contengan el término en el nombre
        const searchLower = searchTerm.toLowerCase();
        const matchingProducts = products.filter((p: any) =>
            p.name && p.name.toLowerCase().includes(searchLower)
        );

        // Analizar las categorías de los productos encontrados
        const categoryIds = new Set<number>();
        for (const product of matchingProducts) {
            if (product.categories) {
                for (const cat of product.categories) {
                    categoryIds.add(cat.id);
                }
            }
            if (product.id_category_default) {
                categoryIds.add(product.id_category_default);
            }
        }

        return NextResponse.json({
            busqueda: searchTerm,
            totalAnalizados: products.length,
            productosEncontrados: matchingProducts.length,
            categoriasDeProductos: Array.from(categoryIds),
            productos: matchingProducts.slice(0, 10).map((p: any) => ({
                id: p.id,
                name: p.name,
                id_category_default: p.id_category_default,
                categories: p.categories?.map((c: any) => c.id),
                manufacturer_id: p.manufacturer_id,
            })),
        });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
        }, { status: 500 });
    }
}
