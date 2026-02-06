import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';

/**
 * Debug: Ver las asociaciones de productos de una categoria
 * Uso: /api/debug/category-associations?category=103
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categoryId = parseInt(searchParams.get('category') || '0');

    if (!categoryId) {
        return NextResponse.json({
            error: 'Se requiere parametro category (ID numerico)',
            ejemplo: '/api/debug/category-associations?category=103'
        }, { status: 400 });
    }

    try {
        // Obtener la categoria con display=full para ver associations
        const categoryData = await PrestaShopService.getCategoryById(categoryId);

        if (!categoryData) {
            return NextResponse.json({
                error: 'Categoria no encontrada',
                categoryId,
            }, { status: 404 });
        }

        // Extraer la categoria
        const category = categoryData.category || categoryData.categories?.category || categoryData;

        // Buscar productos en associations
        let productIds: number[] = [];

        if (category.associations?.products) {
            const products = category.associations.products;
            if (Array.isArray(products)) {
                productIds = products.map((p: any) => parseInt(p.id || p));
            } else if (products.product) {
                const productList = Array.isArray(products.product) ? products.product : [products.product];
                productIds = productList.map((p: any) => parseInt(p.id || p));
            }
        }

        return NextResponse.json({
            categoryId,
            categoryName: category.name?.language?.[0]?.['#text'] || category.name?.language?.['#text'] || category.name || 'Sin nombre',
            productsCount: category.nb_products_recursive || 0,
            associatedProductIds: productIds.length,
            productIdsSample: productIds.slice(0, 20),
            rawAssociations: category.associations || null,
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack,
        }, { status: 500 });
    }
}
