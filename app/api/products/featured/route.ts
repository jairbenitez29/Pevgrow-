import { NextResponse } from 'next/server';
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '8';

    // Obtener productos destacados de PrestaShop
    const psProducts = await PrestaShopService.getFeaturedProducts({
      limit: parseInt(limit),
    });

    const products = PrestaShopTransformer.transformProducts(psProducts);

    return NextResponse.json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error: any) {
    console.error('Error fetching featured products:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      data: [],
    }, { status: 500 });
  }
}
