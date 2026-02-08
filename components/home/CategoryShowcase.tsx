'use client';

import { useEffect, useState, useRef } from 'react';
import { Link } from '@/i18n/routing';
import ProductCard from '@/components/products/ProductCard';

interface CategoryShowcaseProps {
  title: string;
  categorySlug: string;
  bgColor?: string;
}

export default function CategoryShowcase({ title, categorySlug, bgColor = 'bg-white' }: CategoryShowcaseProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Primero obtener el ID de la categoria por su slug
        const catRes = await fetch(`/api/category/${categorySlug}`);
        const catData = await catRes.json();

        if (!catData.data?.id) {
          setIsLoading(false);
          return;
        }

        // Luego cargar 12 productos de esa categoria
        const prodRes = await fetch(`/api/product?category=${catData.data.id}&limit=12`);
        const prodData = await prodRes.json();

        if (prodData.data && prodData.data.length > 0) {
          setProducts(prodData.data);
        }
      } catch (error) {
        console.error(`Error loading products for ${categorySlug}:`, error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [categorySlug]);

  // Detectar scroll para mostrar "Ver mas"
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    function handleScroll() {
      if (!container) return;
      const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 100;
      setShowSeeMore(isAtEnd);
    }

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [products]);

  if (isLoading) {
    return (
      <section className={`py-10 ${bgColor}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-56 bg-gray-100 rounded-xl animate-pulse aspect-[3/4]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className={`py-10 ${bgColor}`}>
      <div className="container mx-auto px-4">
        {/* Header con titulo y enlace */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <Link
            href={`/categoria/${categorySlug}`}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            Ver todo
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Carrusel horizontal */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollBehavior: 'smooth' }}
          >
            {products.map((product: any) => (
              <div key={product.id} className="flex-shrink-0 w-52 md:w-56">
                <ProductCard product={product} />
              </div>
            ))}

            {/* "Ver mas" al final del carrusel */}
            <div
              className={`flex-shrink-0 w-52 md:w-56 flex items-center justify-center transition-opacity duration-300 ${
                showSeeMore ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <Link
                href={`/categoria/${categorySlug}`}
                className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all w-full h-full min-h-[280px] justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600">Ver mas productos</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
