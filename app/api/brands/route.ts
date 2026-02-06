import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';

/**
 * ID de la categoria padre que contiene las marcas
 * En PrestaShop, las marcas pueden estar modeladas como subcategorias
 */
const BRANDS_PARENT_CATEGORY_ID = 11;

/**
 * Obtener marcas de PrestaShop
 * Intenta primero obtener manufacturers, si no hay, usa categorias como fallback
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') || '12';
        const limitNum = parseInt(limit);

        // Intentar obtener manufacturers primero (fuente principal de marcas)
        try {
            const psManufacturers = await PrestaShopService.getManufacturers({
                limit: 50,
            });

            const manufacturers = PrestaShopTransformer.transformManufacturers(psManufacturers);

            if (manufacturers && manufacturers.length > 0) {
                const brands = manufacturers
                    .slice(0, limitNum)
                    .map((mf: any) => ({
                        id: mf.id,
                        name: mf.name,
                        slug: mf.slug,
                        image: mf.image,
                        type: 'manufacturer', // Indica que es un manufacturer real
                    }));

                return NextResponse.json({
                    success: true,
                    count: brands.length,
                    brands: brands,
                    source: 'manufacturers',
                });
            }
        } catch (manufacturerError: any) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[Brands] Error obteniendo manufacturers, intentando fallback de categorias:', manufacturerError.message);
            }
        }

        // Fallback: Usar categorias hijas de BRANDS_PARENT_CATEGORY_ID como marcas
        try {
            const psCategories = await PrestaShopService.getCategoriesByParentId(BRANDS_PARENT_CATEGORY_ID);
            const brandCategories = PrestaShopTransformer.transformCategories(psCategories);

            if (brandCategories && brandCategories.length > 0) {
                const brands = brandCategories
                    .slice(0, limitNum)
                    .map((cat: any) => ({
                        id: cat.id,
                        name: cat.name,
                        slug: cat.slug,
                        image: cat.category_image || null,
                        products_count: cat.products_count || cat.nb_products_recursive || null,
                        type: 'category', // Indica que es una categoria usada como marca
                    }));

                return NextResponse.json({
                    success: true,
                    count: brands.length,
                    brands: brands,
                    source: 'categories',
                });
            }
        } catch (categoryError: any) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[Brands] Error obteniendo categorias de marcas:', categoryError.message);
            }
        }

        // Si no hay marcas de ninguna fuente, devolver lista vacia
        return NextResponse.json({
            success: true,
            count: 0,
            brands: [],
        });
    } catch (error: any) {
        console.error('Error fetching brands:', error.message);
        return NextResponse.json({
            success: true,
            count: 0,
            brands: [],
        });
    }
}
