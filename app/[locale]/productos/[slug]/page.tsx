import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ProductGallery from '@/components/products/ProductGallery';
import ProductDetails from '@/components/products/ProductDetails';
import RelatedProducts from '@/components/products/RelatedProducts';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

interface ProductPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

async function getProduct(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/product/${slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}


export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Producto no encontrado',
    };
  }

  return {
    title: `${product.name} | Pevgrow`,
    description: product.short_description?.replace(/<[^>]*>/g, '').substring(0, 160) || product.name,
    openGraph: {
      title: product.name,
      description: product.short_description?.replace(/<[^>]*>/g, '').substring(0, 160) || product.name,
      images: product.product_thumbnail?.original_url ? [product.product_thumbnail.original_url] : [],
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations();
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Obtener categoria principal para productos relacionados
  const mainCategory = product.categories && product.categories.length > 0
    ? product.categories[0]
    : null;

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: t('common.products'),
      href: `/${locale}/productos`,
    },
  ];

  // Add category to breadcrumbs if available
  if (product.categories && product.categories.length > 0) {
    const category = product.categories[0];
    breadcrumbItems.push({
      label: category.name,
      href: `/${locale}/categoria/${category.slug}`,
    });
  }

  breadcrumbItems.push({
    label: product.name,
    href: `/${locale}/productos/${product.slug}`,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Product Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gallery */}
            <div>
              <ProductGallery
                images={product.images || []}
                productName={product.name}
              />
            </div>

            {/* Details */}
            <div>
              <ProductDetails product={product} />
            </div>
          </div>
        </div>

        {/* Full Description */}
        {product.description && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('product.description')}
            </h2>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* Related Products - Carga del lado del cliente */}
        {mainCategory && (
          <RelatedProducts
            categoryId={mainCategory.id}
            currentProductId={product.id}
            limit={8}
          />
        )}

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.name,
              image: product.product_thumbnail?.original_url || '',
              description: product.short_description?.replace(/<[^>]*>/g, '') || product.name,
              sku: product.reference || product.id.toString(),
              offers: {
                '@type': 'Offer',
                url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/productos/${product.slug}`,
                priceCurrency: 'EUR',
                price: product.sale_price || product.price,
                availability: product.stock_status === 'in_stock'
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
              },
            }),
          }}
        />
      </div>
    </div>
  );
}
