import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Buscar directamente por slug en PrestaShop (mas eficiente)
    const psCategory = await PrestaShopService.getCategoryBySlug(slug);

    if (psCategory?.category) {
      const category = PrestaShopTransformer.transformCategory(psCategory.category);
      return NextResponse.json({
        data: category,
      });
    }

    // Fallback: buscar en cache de categorias
    const psCategories = await PrestaShopService.getCategories({});
    const allCategories = PrestaShopTransformer.transformCategories(psCategories);
    const category = allCategories.find((c: any) => c.slug === slug);

    if (category) {
      return NextResponse.json({
        data: category,
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Category] Slug "${slug}" no encontrado`);
    }

    return NextResponse.json({
      error: 'Categoria no encontrada',
    }, { status: 404 });
  } catch (error: any) {
    console.error('Error fetching category by slug:', error);

    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}
