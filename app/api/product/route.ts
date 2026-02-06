import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const category = searchParams.get('category');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Si hay filtro de categoria, usar el metodo optimizado
        if (category) {
            const categoryId = parseInt(category);

            // Obtener productos directamente desde las asociaciones de la categoria
            const result = await PrestaShopService.getProductsByCategory(categoryId, limit, offset);

            // Transformar productos
            const products = PrestaShopTransformer.transformProducts({ products: result.products });

            return NextResponse.json({
                data: products,
                total: result.total,
            });
        }

        // Sin filtro: cargar productos con paginacion directa desde PrestaShop
        const psProducts = await PrestaShopService.getProducts({
            limit,
            offset,
        });

        const products = PrestaShopTransformer.transformProducts(psProducts);

        // Calcular si hay mas productos
        // Si recibimos el limite completo, probablemente hay mas
        const hasMore = products.length === limit;

        return NextResponse.json({
            data: products,
            total: hasMore ? offset + limit + 1000 : offset + products.length, // Estimacion para paginacion
            hasMore: hasMore,
            offset: offset,
            limit: limit,
        });
    } catch (error: any) {
        console.error('Error fetching products:', error);

        return NextResponse.json({
            data: [],
            total: 0,
            error: error.message,
        }, { status: 500 });
    }
}
