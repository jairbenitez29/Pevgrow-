import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';

/**
 * Obtener productos de una marca (manufacturer)
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const manufacturerId = parseInt(id);

        if (!manufacturerId) {
            return NextResponse.json({
                error: 'ID de marca invalido',
            }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Obtener productos filtrados por manufacturer
        const result = await PrestaShopService.getProductsByManufacturer(manufacturerId, limit, offset);

        // Transformar productos
        const products = PrestaShopTransformer.transformProducts({ products: result.products });

        return NextResponse.json({
            data: products,
            total: result.total,
        });
    } catch (error: any) {
        console.error('Error fetching products by brand:', error);

        return NextResponse.json({
            data: [],
            total: 0,
            error: error.message,
        }, { status: 500 });
    }
}
