import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';

/**
 * Debug: Buscar productos que pertenecen a una marca
 * Busca por id_manufacturer y por nombre de marca
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const brandId = parseInt(searchParams.get('id') || '0');
    const brandName = searchParams.get('name') || '';

    if (!brandId && !brandName) {
        return NextResponse.json({
            error: 'Se requiere parametro id o name',
            ejemplo: '/api/debug/find-brand-products?id=2480 o ?name=Sweet'
        }, { status: 400 });
    }

    try {
        // Cargar productos (primeros 200)
        const psProducts = await PrestaShopService.getProducts({ limit: 200 });
        const products = PrestaShopTransformer.transformProducts(psProducts);

        // Buscar por diferentes criterios
        const results = {
            byManufacturerId: [] as any[],
            byManufacturerName: [] as any[],
            byCategoryId: [] as any[],
        };

        for (const product of products) {
            // Por manufacturer_id
            if (brandId && product.manufacturer_id === brandId) {
                results.byManufacturerId.push({
                    id: product.id,
                    name: product.name,
                    manufacturer_id: product.manufacturer_id,
                    manufacturer_name: product.manufacturer_name,
                });
            }

            // Por manufacturer_name
            if (brandName && product.manufacturer_name?.toLowerCase().includes(brandName.toLowerCase())) {
                results.byManufacturerName.push({
                    id: product.id,
                    name: product.name,
                    manufacturer_id: product.manufacturer_id,
                    manufacturer_name: product.manufacturer_name,
                });
            }

            // Por categoria
            if (brandId && product.categories) {
                const inCategory = product.categories.some((cat: any) => {
                    const catId = typeof cat.id === 'string' ? parseInt(cat.id) : cat.id;
                    return catId === brandId;
                });
                if (inCategory) {
                    results.byCategoryId.push({
                        id: product.id,
                        name: product.name,
                        categories: product.categories,
                    });
                }
            }
        }

        // También probar el filtro directo de manufacturer en PrestaShop
        let directFilterResults: any = { products: [], total: 0 };
        if (brandId) {
            try {
                directFilterResults = await PrestaShopService.getProductsByManufacturer(brandId, 10, 0);
            } catch (e: any) {
                directFilterResults = { error: e.message };
            }
        }

        return NextResponse.json({
            brandId,
            brandName,
            totalProductosAnalizados: products.length,
            resultados: {
                porManufacturerId: results.byManufacturerId.length,
                porManufacturerName: results.byManufacturerName.length,
                porCategoriaId: results.byCategoryId.length,
            },
            muestras: {
                byManufacturerId: results.byManufacturerId.slice(0, 5),
                byManufacturerName: results.byManufacturerName.slice(0, 5),
                byCategoryId: results.byCategoryId.slice(0, 5),
            },
            filtroDirectoPrestaShop: {
                total: directFilterResults.total || 0,
                error: directFilterResults.error || null,
                productos: directFilterResults.products?.slice(0, 3).map((p: any) => ({
                    id: p.id,
                    name: p.name?.language?.[0]?.['#text'] || p.name,
                    id_manufacturer: p.id_manufacturer,
                })) || [],
            },
            // Mostrar manufacturers únicos encontrados
            manufacturersEncontrados: [...new Set(products.map((p: any) => p.manufacturer_name).filter(Boolean))].slice(0, 20),
        });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
        }, { status: 500 });
    }
}
