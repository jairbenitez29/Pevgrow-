import { NextResponse } from "next/server";
import PrestaShopService from '@/lib/prestashop/PrestaShopService';
import PrestaShopTransformer from '@/lib/prestashop/PrestaShopTransformer';

/**
 * Extraer ID del producto desde el slug
 * El slug tiene formato: "7400-nombre-del-producto"
 * Retorna el ID si existe, o null si no es un slug con ID
 */
function extractProductIdFromSlug(slug: string): number | null {
  const match = slug.match(/^(\d+)-/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Intentar extraer el ID del slug para busqueda directa
    const productId = extractProductIdFromSlug(slug);

    if (productId) {
      // Busqueda directa por ID (mucho mas rapido)
      try {
        const psProduct = await PrestaShopService.getProductById(productId);
        if (psProduct && psProduct.product) {
          const product = PrestaShopTransformer.transformProduct(psProduct.product);
          return NextResponse.json({
            data: product,
          });
        }
      } catch (idError: any) {
        // Si falla la busqueda por ID, continuar con busqueda por slug
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Product] Busqueda por ID ${productId} fallo, intentando por slug`);
        }
      }
    }

    // Fallback: buscar por slug en todos los productos (mas lento)
    const psProducts = await PrestaShopService.getProducts({ limit: 500 });
    const allProducts = PrestaShopTransformer.transformProducts(psProducts);

    const product = allProducts.find((p: any) => p.slug === slug);

    if (!product) {
      return NextResponse.json({
        error: 'Producto no encontrado',
      }, { status: 404 });
    }

    return NextResponse.json({
      data: product,
    });
  } catch (error: any) {
    console.error('Error fetching product by slug:', error);

    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}
