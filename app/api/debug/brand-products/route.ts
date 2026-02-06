import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';

/**
 * Debug: Ver productos de una marca/categoria
 * Uso: /api/debug/brand-products?id=2480
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const brandId = parseInt(searchParams.get('id') || '0');

    if (!brandId) {
        return NextResponse.json({
            error: 'Se requiere parametro id',
            ejemplo: '/api/debug/brand-products?id=2480'
        }, { status: 400 });
    }

    try {
        // Verificar si es una categoria
        let categoryData = null;
        try {
            categoryData = await PrestaShopService.getCategoryById(brandId);
        } catch (e) {
            // No es categoria
        }

        if (categoryData) {
            const category = categoryData.category || categoryData;

            // Obtener productos de la categoria
            const productIds = await PrestaShopService.getProductIdsByCategory(brandId);

            return NextResponse.json({
                tipo: 'categoria',
                id: brandId,
                nombre: category.name,
                totalProductos: productIds.length,
                productIdsSample: productIds.slice(0, 10),
                mensaje: `Esta marca es una categoria con ${productIds.length} productos`
            });
        }

        // Verificar si es un manufacturer
        let manufacturerData = null;
        try {
            manufacturerData = await PrestaShopService.getManufacturerById(brandId);
        } catch (e) {
            // No es manufacturer
        }

        if (manufacturerData) {
            const manufacturer = manufacturerData.manufacturer || manufacturerData;

            // Obtener productos del manufacturer
            const result = await PrestaShopService.getProductsByManufacturer(brandId, 10, 0);

            return NextResponse.json({
                tipo: 'manufacturer',
                id: brandId,
                nombre: manufacturer.name,
                totalProductos: result.total,
                productosSample: result.products.slice(0, 5).map((p: any) => ({
                    id: p.id,
                    name: p.name?.language?.[0]?.['#text'] || p.name
                })),
                mensaje: `Esta marca es un manufacturer con ${result.total} productos`
            });
        }

        return NextResponse.json({
            error: 'No se encontro ni como categoria ni como manufacturer',
            id: brandId
        }, { status: 404 });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
        }, { status: 500 });
    }
}
