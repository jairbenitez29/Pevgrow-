import { NextResponse } from 'next/server';
import PrestaShopService from '@/lib/prestashop/PrestaShopService';

export async function GET() {
  try {
    const shopInfo = await PrestaShopService.getShopInfo();

    return NextResponse.json({
      success: true,
      data: shopInfo,
    });
  } catch (error: any) {
    console.error('Error fetching shop info:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
