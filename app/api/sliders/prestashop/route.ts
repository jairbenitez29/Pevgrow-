/**
 * API Route: /api/sliders/prestashop
 * Obtiene sliders desde el microservicio Node.js corriendo en el servidor de PrestaShop
 *
 * El microservicio consulta MySQL localmente y expone los datos vía REST
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'es';
    const active = searchParams.get('active') !== 'false';

    // URL del microservicio (configurada en .env.local)
    const microserviceUrl = process.env.SLIDERS_API_URL || 'http://46.224.111.41:3001/api/sliders';

    // Construir URL con parámetros
    const url = `${microserviceUrl}?lang=${lang}&active=${active}`;

    // Hacer petición al microservicio
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // No cachear para obtener siempre los datos más recientes
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Microservice returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching sliders from microservice:', error);

    // Devolver error amigable
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener sliders desde PrestaShop',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Microservicio no disponible',
        slides: [],
      },
      { status: 500 }
    );
  }
}
