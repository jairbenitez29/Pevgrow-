import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';

const BRANDS_PARENT_CATEGORY_ID = 11;

/**
 * Debug: Ver qué marcas tienen productos
 */
export async function GET() {
    try {
        // Obtener marcas (subcategorías de 11)
        const psCategories = await PrestaShopService.getCategoriesByParentId(BRANDS_PARENT_CATEGORY_ID);
        const brands = PrestaShopTransformer.transformCategories(psCategories);

        // Cargar productos
        const psProducts = await PrestaShopService.getProducts({ limit: 500 });
        const products = PrestaShopTransformer.transformProducts(psProducts);

        // Crear mapa de categoría -> productos
        const categoryProductCount: Record<number, number> = {};

        for (const product of products) {
            if (product.categories) {
                for (const cat of product.categories) {
                    categoryProductCount[cat.id] = (categoryProductCount[cat.id] || 0) + 1;
                }
            }
        }

        // Ver qué marcas tienen productos
        const brandsWithProducts = brands.map((brand: any) => ({
            id: brand.id,
            name: brand.name,
            productsInCategory: categoryProductCount[brand.id] || 0,
            nb_products_recursive: brand.products_count,
        })).sort((a: any, b: any) => b.productsInCategory - a.productsInCategory);

        const brandsConProductos = brandsWithProducts.filter((b: any) => b.productsInCategory > 0);
        const brandsSinProductos = brandsWithProducts.filter((b: any) => b.productsInCategory === 0);

        return NextResponse.json({
            totalMarcas: brands.length,
            marcasConProductos: brandsConProductos.length,
            marcasSinProductos: brandsSinProductos.length,
            topMarcasConProductos: brandsConProductos.slice(0, 20),
            ejemploMarcasSinProductos: brandsSinProductos.slice(0, 10),
            nota: 'productsInCategory = productos encontrados en los primeros 500 productos',
        });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
        }, { status: 500 });
    }
}
