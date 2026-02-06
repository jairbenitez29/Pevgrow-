import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';

/**
 * Obtener una marca por su ID
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Intentar como ID numerico primero
        const manufacturerId = parseInt(id);

        if (manufacturerId && !isNaN(manufacturerId)) {
            const psManufacturer = await PrestaShopService.getManufacturerById(manufacturerId);

            if (psManufacturer) {
                const manufacturer = psManufacturer.manufacturer || psManufacturer;

                // Extraer nombre
                let name = manufacturer.name;
                if (typeof name === 'object' && name.language) {
                    name = Array.isArray(name.language)
                        ? name.language[0]?.['#text'] || name.language[0]?.value || name.language[0]
                        : name.language['#text'] || name.language.value || name.language;
                }

                return NextResponse.json({
                    data: {
                        id: parseInt(manufacturer.id),
                        name: name,
                        slug: String(name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                        description: manufacturer.description || '',
                        active: manufacturer.active === '1' || manufacturer.active === 1,
                    },
                });
            }
        }

        // Si no es numerico, buscar por slug en la lista de manufacturers
        const psManufacturers = await PrestaShopService.getManufacturers({ limit: 100 });
        const manufacturers = PrestaShopTransformer.transformManufacturers(psManufacturers);

        const manufacturer = manufacturers.find((m: any) =>
            m.slug === id || m.name.toLowerCase().replace(/\s+/g, '-') === id.toLowerCase()
        );

        if (manufacturer) {
            return NextResponse.json({
                data: manufacturer,
            });
        }

        return NextResponse.json({
            error: 'Marca no encontrada',
        }, { status: 404 });
    } catch (error: any) {
        console.error('Error fetching brand:', error);

        return NextResponse.json({
            error: error.message,
        }, { status: 500 });
    }
}
