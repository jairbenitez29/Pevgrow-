'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface Slide {
  id: number;
  title: string;
  description: string;
  image: string;
  url: string;
  position: number;
  active: boolean;
}

interface ImageSliderProps {
  autoplayInterval?: number; // en milisegundos
  showNavigation?: boolean;
  showIndicators?: boolean;
}

export default function ImageSlider({
  autoplayInterval = 10000, // 10 segundos por defecto
  showNavigation = true,
  showIndicators = true,
}: ImageSliderProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Cargar slides desde la API
  useEffect(() => {
    async function fetchSlides() {
      try {
        const response = await fetch('/api/sliders?active=true');
        const data = await response.json();

        if (data.success && data.slides && data.slides.length > 0) {
          setSlides(data.slides);
        }
      } catch (error) {
        console.error('Error fetching slides:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSlides();
  }, []);

  // Navegación manual
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsPaused(true); // Pausar autoplay cuando se navega manualmente
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setIsPaused(true);
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  // Autoplay
  useEffect(() => {
    if (!isPaused && slides.length > 1) {
      const interval = setInterval(() => {
        goToNext();
      }, autoplayInterval);

      return () => clearInterval(interval);
    }
  }, [isPaused, slides.length, autoplayInterval, goToNext]);

  // Reanudar autoplay después de pausa manual
  useEffect(() => {
    if (isPaused) {
      const timeout = setTimeout(() => {
        setIsPaused(false);
      }, autoplayInterval * 1.5); // Reanudar después de 1.5x el intervalo

      return () => clearTimeout(timeout);
    }
  }, [isPaused, autoplayInterval]);

  if (isLoading) {
    return (
      <section className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-pink-700 text-white">
        <div className="container mx-auto px-4 py-32">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    // Fallback: mostrar HeroBanner estático si no hay slides
    return (
      <section className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-pink-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
        </div>

        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Las Mejores Semillas de
              <span className="block text-yellow-300">Cannabis del Mercado</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              Envío gratuito · Entrega discreta · Semillas gratis con cada compra
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/productos">
                <button className="bg-white text-purple-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 hover:scale-105 transition-all shadow-lg">
                  Ver Todos los Productos
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const slide = slides[currentSlide];

  return (
    <section
      className="relative bg-gray-900 text-white overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slider Container - aspect ratio adaptado a banners panorámicos */}
      <div className="relative aspect-[1920/380]">
        {/* Slides */}
        {slides.map((slideItem, index) => (
          <div
            key={slideItem.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {slideItem.url ? (
              <Link href={slideItem.url} className="absolute inset-0 cursor-pointer">
                <Image
                  src={slideItem.image}
                  alt={slideItem.title || 'Promoción Pevgrow'}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                />
              </Link>
            ) : (
              <Image
                src={slideItem.image}
                alt={slideItem.title || 'Promoción Pevgrow'}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
            )}
          </div>
        ))}

        {/* Navigation Arrows */}
        {showNavigation && slides.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-purple-900/80 hover:bg-purple-700 backdrop-blur-sm text-white p-4 rounded-full transition-all shadow-2xl hover:scale-110"
              aria-label="Slide anterior"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-purple-900/80 hover:bg-purple-700 backdrop-blur-sm text-white p-4 rounded-full transition-all shadow-2xl hover:scale-110"
              aria-label="Siguiente slide"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Indicators */}
        {showIndicators && slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3 backdrop-blur-sm bg-black/30 px-4 py-2 rounded-full">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 rounded-full transition-all shadow-lg ${
                  index === currentSlide
                    ? 'bg-purple-500 w-10'
                    : 'bg-white/60 w-3 hover:bg-white hover:w-6'
                }`}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
