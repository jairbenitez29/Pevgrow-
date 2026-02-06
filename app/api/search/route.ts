import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = searchParams.get('limit') || '50';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        data: [],
        total: 0,
        message: 'La búsqueda debe tener al menos 2 caracteres'
      });
    }

    const psProducts = await PrestaShopService.searchProducts(query, {
      limit: parseInt(limit),
    });

    const products = PrestaShopTransformer.transformProducts(psProducts);

    return NextResponse.json({
      data: products,
      total: products.length,
      query: query,
    });
  } catch (error: any) {
    console.error('Error en búsqueda:', error);

    return NextResponse.json({
      data: [],
      total: 0,
      error: error.message,
    }, { status: 500 });
  }
}
