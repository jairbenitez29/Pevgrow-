import { NextResponse } from 'next/server';
import PrestaShopService from '@/lib/prestashop/PrestaShopService';

export async function GET() {
  try {
    // Intentar obtener configuraciones clave de PrestaShop
    const configurations = await PrestaShopService.getConfigurations({
      filter: {
        name: '[PS_SHOP_NAME|PS_SHOP_EMAIL|PS_LOGO|PS_STORES_SIMPLIFIED]'
      }
    });

    return NextResponse.json({
      success: true,
      data: configurations,
    });
  } catch (error: any) {
    console.error('Error fetching shop config:', error);

    // Si falla, devolver configuración por defecto
    return NextResponse.json({
      success: true,
      data: {
        shopName: 'Pevgrow',
        shopEmail: 'info@pevgrow.com',
        freeShippingFrom: 30,
        discount: '10% dto. Usa FIRSTORDER',
      },
    });
  }
}
