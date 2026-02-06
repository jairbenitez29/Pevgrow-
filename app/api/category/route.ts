import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';

// Timeout en milisegundos para la peticion
const REQUEST_TIMEOUT = 60000;

// Funcion helper para timeout
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), ms);
    });
    return Promise.race([promise, timeout]);
}

export async function GET() {
    try {
        const psCategories = await withTimeout(
            PrestaShopService.getCategories({}),
            REQUEST_TIMEOUT
        );

        const categories = PrestaShopTransformer.transformCategories(psCategories);

        return NextResponse.json({
            data: categories,
            total: categories.length,
        });
    } catch (error: any) {
        console.error('Error fetching categories:', error.message);

        return NextResponse.json({
            data: [],
            total: 0,
            error: error.message,
        });
    }
}
