import ImageSlider from '@/components/home/ImageSlider';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import TopBrands from '@/components/home/TopBrands';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoryShowcase from '@/components/home/CategoryShowcase';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Slider Principal */}
      <ImageSlider autoplayInterval={10000} showNavigation={true} showIndicators={true} />

      {/* Barra de Confianza */}
      <section className="bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-700/50">
            <div className="flex items-center gap-3 py-3.5 px-4 md:px-6 justify-center">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <div>
                <p className="font-semibold text-xs leading-tight">Envio Gratis</p>
                <p className="text-xs text-gray-400 leading-tight">En pedidos +30EUR</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3.5 px-4 md:px-6 justify-center">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <div>
                <p className="font-semibold text-xs leading-tight">Semillas Gratis</p>
                <p className="text-xs text-gray-400 leading-tight">Con cada compra</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3.5 px-4 md:px-6 justify-center">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="font-semibold text-xs leading-tight">Pago Seguro</p>
                <p className="text-xs text-gray-400 leading-tight">100% protegido</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-3.5 px-4 md:px-6 justify-center">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <div>
                <p className="font-semibold text-xs leading-tight">Soporte 24/7</p>
                <p className="text-xs text-gray-400 leading-tight">Siempre contigo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias Destacadas */}
      <FeaturedCategories />

      {/* Productos Destacados */}
      <FeaturedProducts />

      {/* Top Marcas */}
      <TopBrands />

      {/* Secciones por Categoria */}
      <CategoryShowcase title="Top Grow Shop" categorySlug="grow-shop" bgColor="bg-white" />
      <CategoryShowcase title="Top Head Shop" categorySlug="head-shop" bgColor="bg-gray-50" />
      <CategoryShowcase title="Top Vape Shop" categorySlug="vape-shop" bgColor="bg-white" />
      <CategoryShowcase title="Top CBD Shop" categorySlug="cbd-shop" bgColor="bg-gray-50" />
    </div>
  );
}
