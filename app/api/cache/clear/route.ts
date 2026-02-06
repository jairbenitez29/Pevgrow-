import { NextResponse } from 'next/server';
import memoryCache from '@/utils/cache/MemoryCache';

/**
 * Endpoint temporal para limpiar la caché en desarrollo
 * Solo disponible en desarrollo
 */
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Solo disponible en desarrollo' },
      { status: 403 }
    );
  }

  try {
    memoryCache.clear();

    return NextResponse.json({
      success: true,
      message: 'Caché limpiada correctamente',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
