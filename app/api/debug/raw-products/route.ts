import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';

/**
 * Debug: Ver datos crudos de productos de PrestaShop
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    try {
        const psProducts = await PrestaShopService.getProducts({ limit });

        // Extraer productos
        let products: any[] = [];
        if (psProducts?.products?.product) {
            products = Array.isArray(psProducts.products.product)
                ? psProducts.products.product
                : [psProducts.products.product];
        } else if (psProducts?.products && Array.isArray(psProducts.products)) {
            products = psProducts.products;
        }

        // Mostrar campos relevantes de cada producto
        const summary = products.map((p: any) => ({
            id: p.id,
            name: typeof p.name === 'string' ? p.name : (p.name?.language?.[0]?.value || p.name),
            id_manufacturer: p.id_manufacturer,
            manufacturer_name: p.manufacturer_name,
            id_category_default: p.id_category_default,
            categories_count: p.associations?.categories?.length || 0,
        }));

        // Buscar manufacturers únicos
        const manufacturerIds = [...new Set(products.map(p => p.id_manufacturer).filter(Boolean))];

        return NextResponse.json({
            totalProducts: products.length,
            manufacturerIdsEncontrados: manufacturerIds,
            productos: summary,
            // Mostrar un producto completo para debug
            productoCompletoEjemplo: products[0] ? {
                id: products[0].id,
                id_manufacturer: products[0].id_manufacturer,
                id_category_default: products[0].id_category_default,
                associations: products[0].associations,
            } : null,
        });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
        }, { status: 500 });
    }
}
