/**
 * API Route: /api/sliders
 * Obtiene los sliders configurados para el homepage
 * Primero intenta desde MySQL, si falla usa datos estáticos
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active') !== 'false'; // activos por defecto
    const lang = searchParams.get('lang') || 'es';

    // Intentar obtener desde MySQL (endpoint interno)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const response = await fetch(
        `${baseUrl}/sliders/prestashop?active=${active}&lang=${lang}`,
        {
          cache: 'no-store', // No cachear en fetch
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.slides && data.slides.length > 0) {
          return NextResponse.json(data);
        }
      }
    } catch (mysqlError: any) {
      console.warn('MySQL sliders not available, falling back to static data:', mysqlError.message);
    }

    // Fallback: Datos estáticos si MySQL falla
    const staticSlides = {
      slides: [
        {
          id: 1,
          title: 'Semillas Gratis con cada compra',
          description: 'Consigue semillas gratis en todos tus pedidos',
          image: 'https://placehold.co/1920x600/6B46C1/FFFFFF/png?text=Semillas+Gratis',
          url: '/productos',
          position: 1,
          active: true,
        },
        {
          id: 2,
          title: 'Nuevas Variedades 2026',
          description: 'Descubre las últimas genéticas del mercado',
          image: 'https://placehold.co/1920x600/EC4899/FFFFFF/png?text=Nuevas+Variedades',
          url: '/productos',
          position: 2,
          active: true,
        },
        {
          id: 3,
          title: 'Envío Discreto y Seguro',
          description: 'Garantizamos la máxima discreción en todos tus envíos',
          image: 'https://placehold.co/1920x600/7C3AED/FFFFFF/png?text=Envío+Discreto',
          url: '/productos',
          position: 3,
          active: true,
        },
      ],
    };

    return NextResponse.json({
      success: true,
      slides: staticSlides.slides,
      total: staticSlides.slides.length,
      source: 'static',
    });
  } catch (error: any) {
    console.error('Error in /api/sliders:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al obtener los sliders',
        slides: [],
      },
      { status: 500 }
    );
  }
}
