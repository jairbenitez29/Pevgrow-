import { NextResponse } from 'next/server';
import PrestaShopService from '@/lib/prestashop/PrestaShopService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');

    // Obtener todas las categorías
    const psCategories = await PrestaShopService.getCategories({ limit: 500 });

    // Si se especifica un ID, obtener también los detalles completos de esa categoría
    let categoryDetail = null;
    if (categoryId) {
      try {
        categoryDetail = await PrestaShopService.getCategoryById(parseInt(categoryId));
      } catch (error) {
        console.error('Error obteniendo categoría:', error);
      }
    }

    return NextResponse.json({
      success: true,
      rawCategories: psCategories,
      categoryDetail: categoryDetail,
    });
  } catch (error: any) {
    console.error('Error en debug categories:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
