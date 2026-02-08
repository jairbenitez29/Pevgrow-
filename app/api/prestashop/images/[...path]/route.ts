/**
 * Proxy de imágenes de PrestaShop
 * Sirve las imágenes a través de nuestro servidor para evitar problemas de CORS y 503
 */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  let imagePath = 'unknown';
  try {
    const resolvedParams = await params;
    imagePath = Array.isArray(resolvedParams.path) ? resolvedParams.path.join('/') : resolvedParams.path;

    const baseURL = process.env.PRESTASHOP_IMAGE_URL || 'https://ps9.pevgrow.com';

    // Detectar el tipo de imagen: manufacturer, category o producto
    // Las rutas vienen como:
    // - manufacturers/5.jpg
    // - categories/3/0/1/1/3011-category_default.jpg
    // - 2/6/3/9/5/26395-large_default.jpg (productos)
    let imageUrl;
    if (imagePath.startsWith('general/')) {
      // Imágenes generales de la tienda (logo, favicon, etc.)
      // Ruta: general/header, general/mail, general/invoice, general/store_icon
      const imageType = imagePath.replace('general/', '');
      imageUrl = `${baseURL}/api/images/general/${imageType}`;
    } else if (imagePath.startsWith('manufacturers/')) {
      // Es una imagen de manufacturer
      const manufacturerPath = imagePath.replace('manufacturers/', '');
      const manufacturerId = manufacturerPath.replace('.jpg', '').replace(/\//g, '');

      // PrestaShop puede usar diferentes rutas para imágenes de manufacturers:
      // 1. API de imágenes: /api/images/manufacturers/{id} (más confiable)
      // 2. Archivo directo: /img/m/{id}.jpg (aunque este directorio puede tener idiomas)
      // Intentaremos primero con la API de imágenes, luego con archivo directo
      imageUrl = `${baseURL}/api/images/manufacturers/${manufacturerId}`;
    } else if (imagePath.startsWith('categories/')) {
      // Es una imagen de categoría
      const categoryPath = imagePath.replace('categories/', '');
      // Extraer el ID de la categoría del path (el último número antes del guión)
      const match = categoryPath.match(/(\d+)-/);
      const categoryId = match ? match[1] : null;

      // Intentar primero con la API de imágenes de PrestaShop
      if (categoryId) {
        imageUrl = `${baseURL}/api/images/categories/${categoryId}`;
      } else {
        // Fallback: usar la ruta directa
        imageUrl = `${baseURL}/img/c/${categoryPath}`;
      }
    } else {
      // Es una imagen de producto: usar /img/p/
      imageUrl = `${baseURL}/img/p/${imagePath}`;
    }

    // Obtener credenciales de autenticación
    const htaccessUser = process.env.PRESTASHOP_HTACCESS_USER || 'dev';
    const htaccessPassword = process.env.PRESTASHOP_HTACCESS_PASSWORD || 'pevgrowPs9!Dev';
    const apiKey = process.env.PRESTASHOP_API_KEY || '';

    // Intentar obtener la imagen desde PrestaShop
    // Estrategia: Intentar con API Key primero (si PrestaShop lo permite), luego con .htaccess
    let response;
    let lastError = null;

    // Método 1: Intentar con API Key de PrestaShop (usando HTTP Basic Auth)
    if (apiKey) {
      try {
        response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 15000,
          auth: {
            username: apiKey,
            password: '',
          },
          headers: {
            'Accept': 'image/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          validateStatus: (status: number) => status < 500,
        });

      } catch (apiError) {
        lastError = apiError;
      }
    }

    // Método 2: Si falló o no hay API Key, intentar con .htaccess
    if (!response || response.status !== 200) {
      try {
        response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 15000,
          auth: {
            username: htaccessUser,
            password: htaccessPassword,
          },
          headers: {
            'Accept': 'image/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          validateStatus: (status: number) => status < 500,
        });
      } catch (htaccessError) {
        lastError = htaccessError;
      }
    }

    // Método 3: Para manufacturers, intentar también con /img/m/{id}.jpg si la API falló
    if ((!response || response.status !== 200) && imagePath.startsWith('manufacturers/')) {
      const manufacturerPath = imagePath.replace('manufacturers/', '');
      const manufacturerId = manufacturerPath.replace('.jpg', '').replace(/\//g, '');
      const fallbackUrl = `${baseURL}/img/m/${manufacturerId}.jpg`;

      try {
        response = await axios.get(fallbackUrl, {
          responseType: 'arraybuffer',
          timeout: 15000,
          auth: apiKey ? { username: apiKey, password: '' } : { username: htaccessUser, password: htaccessPassword },
          headers: {
            'Accept': 'image/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          validateStatus: (status: number) => status < 500,
        });
      } catch (fallbackError) {
        // Silenciar errores de fallback
      }
    }

    // Método 3.5: Para categorías, intentar con /img/c/ si la API falló
    if ((!response || response.status !== 200) && imagePath.startsWith('categories/')) {
      const categoryPath = imagePath.replace('categories/', '');
      const fallbackUrl = `${baseURL}/img/c/${categoryPath}`;

      try {
        response = await axios.get(fallbackUrl, {
          responseType: 'arraybuffer',
          timeout: 15000,
          auth: apiKey ? { username: apiKey, password: '' } : { username: htaccessUser, password: htaccessPassword },
          headers: {
            'Accept': 'image/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          validateStatus: (status: number) => status < 500,
        });
      } catch (fallbackError) {
        // Silenciar errores de fallback
      }
    }

    // Método 4: Último intento sin autenticación
    if (!response || response.status !== 200) {
      try {
        response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 15000,
          headers: {
            'Accept': 'image/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          validateStatus: (status: number) => status < 500,
        });
      } catch (noAuthError) {
        lastError = noAuthError;
        throw noAuthError;
      }
    }

    // Si la respuesta no es exitosa, devolver 404
    if (!response || response.status !== 200) {
      return new NextResponse(null, {
        status: 404,
      });
    }

    // Determinar el tipo de contenido
    const contentType = response.headers['content-type'] || 'image/jpeg';

    // Verificar que realmente sea una imagen
    if (!contentType.startsWith('image/')) {
      return new NextResponse(null, {
        status: 404,
      });
    }

    // Devolver la imagen
    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ Error fetching image ${imagePath}:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        responseData: error.response?.data ? 'Present' : 'None'
      });
    }

    // Devolver error 404
    return new NextResponse(null, {
      status: 404,
    });
  }
}
