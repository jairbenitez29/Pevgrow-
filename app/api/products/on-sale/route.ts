import { NextResponse } from 'next/server';
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '12';

    // Obtener productos de PrestaShop
    const psProducts = await PrestaShopService.getProductsOnSale({
      limit: parseInt(limit) * 2, // Obtener más para filtrar
    });

    const allProducts = PrestaShopTransformer.transformProducts(psProducts);

    // Filtrar productos con descuento
    const productsOnSale = allProducts.filter((p: any) =>
      p.is_sale_enable && p.discount && p.discount > 0
    );

    // Limitar al número solicitado
    const limitedProducts = productsOnSale.slice(0, parseInt(limit));

    return NextResponse.json({
      success: true,
      data: limitedProducts,
      total: limitedProducts.length,
    });
  } catch (error: any) {
    console.error('Error fetching products on sale:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      data: [],
    }, { status: 500 });
  }
}
