import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';

/**
 * Obtener categorias especificas por sus IDs
 * Endpoint: GET /api/category/featured?ids=1007,1008,1168
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const idsParam = searchParams.get('ids') || '';

        if (!idsParam) {
            return NextResponse.json({
                data: [],
                total: 0,
                error: 'Se requiere el parametro ids',
            });
        }

        // Parsear los IDs
        const ids = idsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

        if (ids.length === 0) {
            return NextResponse.json({
                data: [],
                total: 0,
            });
        }

        // Obtener categorias por IDs
        const psCategories = await PrestaShopService.getCategoriesByIds(ids);
        const categories = PrestaShopTransformer.transformCategories(psCategories);

        return NextResponse.json({
            data: categories,
            total: categories.length,
        });
    } catch (error: any) {
        console.error('Error fetching featured categories:', error.message);

        return NextResponse.json({
            data: [],
            total: 0,
            error: error.message,
        });
    }
}
