import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';

/**
 * Debug: Analizar productos de una categoria especifica
 * Uso: /api/debug/category-products?category=123
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categoryId = parseInt(searchParams.get('category') || '0');

    if (!categoryId) {
        return NextResponse.json({
            error: 'Se requiere parametro category (ID numerico)',
            ejemplo: '/api/debug/category-products?category=123'
        }, { status: 400 });
    }

    try {
        // Cargar todos los productos disponibles (hasta 1000)
        let allProducts: any[] = [];
        let offset = 0;
        const batchSize = 100;
        const maxProducts = 1000;

        while (offset < maxProducts) {
            const psProducts = await PrestaShopService.getProducts({
                limit: batchSize,
                offset: offset,
            });

            const products = PrestaShopTransformer.transformProducts(psProducts);

            if (products.length === 0) break;

            allProducts.push(...products);
            offset += batchSize;
        }

        // Analizar cuantos productos pertenecen a la categoria
        const productsInCategory: any[] = [];
        const productsWithCategoryInAssociations: any[] = [];
        const productsWithCategoryAsDefault: any[] = [];

        for (const product of allProducts) {
            let inAssociations = false;
            let isDefault = false;

            // Verificar en associations.categories
            if (product.categories && Array.isArray(product.categories)) {
                inAssociations = product.categories.some((cat: any) => {
                    const catId = typeof cat.id === 'string' ? parseInt(cat.id) : cat.id;
                    return catId === categoryId;
                });
            }

            // Verificar en id_category_default
            if (product.id_category_default) {
                const defaultCatId = typeof product.id_category_default === 'string'
                    ? parseInt(product.id_category_default)
                    : product.id_category_default;
                isDefault = defaultCatId === categoryId;
            }

            if (inAssociations) {
                productsWithCategoryInAssociations.push({
                    id: product.id,
                    name: product.name,
                });
            }

            if (isDefault) {
                productsWithCategoryAsDefault.push({
                    id: product.id,
                    name: product.name,
                });
            }

            if (inAssociations || isDefault) {
                productsInCategory.push({
                    id: product.id,
                    name: product.name,
                    inAssociations,
                    isDefault,
                });
            }
        }

        return NextResponse.json({
            categoryId,
            totalProductosAnalizados: allProducts.length,
            productosEnCategoria: productsInCategory.length,
            detalles: {
                enAssociations: productsWithCategoryInAssociations.length,
                comoDefault: productsWithCategoryAsDefault.length,
            },
            productos: productsInCategory.slice(0, 20), // Mostrar primeros 20
            mensaje: productsInCategory.length === 0
                ? 'No se encontraron productos para esta categoria en los primeros 1000 productos'
                : `Se encontraron ${productsInCategory.length} productos`,
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
        }, { status: 500 });
    }
}
