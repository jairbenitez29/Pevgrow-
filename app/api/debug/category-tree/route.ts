import { NextResponse } from 'next/server';
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';

/**
 * Endpoint de debug para ver el árbol completo de categorías
 */
export async function GET(request: Request) {
  try {
    // Obtener todas las categorías (límite optimizado para balance rendimiento/cobertura)
    const psCategories = await PrestaShopService.getCategories({ limit: 3000 });
    const allCategories = PrestaShopTransformer.transformCategories(psCategories);

    // Ordenar por ID para mejor visualización
    const sortedCategories = allCategories.sort((a: any, b: any) => a.id - b.id);

    // Crear un árbol jerárquico
    function buildTree(categories: any[], parentId: number | null = null, level: number = 0): any[] {
      return categories
        .filter((cat: any) => cat.parent_id === parentId)
        .map((cat: any) => ({
          ...cat,
          _level: level,
          children: buildTree(categories, cat.id, level + 1),
        }));
    }

    // Buscar la raíz (normalmente parent_id = 1 o 2)
    const roots = allCategories.filter((cat: any) => cat.parent_id === 1 || cat.parent_id === 2);

    // Construir árbol desde cada raíz
    const tree = roots.map((root: any) => ({
      ...root,
      _level: 0,
      children: buildTree(allCategories, root.id, 1),
    }));

    // También devolver lista plana para análisis
    const flatList = sortedCategories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      parent_id: cat.parent_id,
      level_depth: cat.level_depth,
      active: cat.active,
      products_count: cat.products_count,
    }));

    return NextResponse.json({
      success: true,
      total: allCategories.length,
      flatList: flatList,
      tree: tree,
      // Buscar categorías relacionadas con "semillas"
      semillas: flatList.filter((cat: any) =>
        cat.name.toLowerCase().includes('semilla')
      ),
    });
  } catch (error: any) {
    console.error('Error en debug category-tree:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
