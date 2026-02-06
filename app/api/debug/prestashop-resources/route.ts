/**
 * API Route de Debug: /api/debug/prestashop-resources
 * Prueba varios endpoints de PrestaShop para encontrar recursos de sliders
 */

import { NextRequest, NextResponse } from 'next/server';
import PrestaShopProxy from '@/lib/prestashop/PrestaShopProxy';

export async function GET(request: NextRequest) {
  const endpoints = [
    '/content_management_system',
    '/configurations',
    '/shops',
    '/image_types',
    '/modules',
    '/homeslider',
    '/homeslider_slides',
    '/slides',
    '/banners',
  ];

  const results: any = {};

  for (const endpoint of endpoints) {
    try {
      const result = await PrestaShopProxy.get(endpoint, { limit: 1 });
      results[endpoint] = {
        success: true,
        hasData: !!result,
        type: typeof result,
      };
    } catch (error: any) {
      results[endpoint] = {
        success: false,
        error: error.response?.status || error.message,
      };
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Prueba de endpoints de PrestaShop',
    results,
  });
}
