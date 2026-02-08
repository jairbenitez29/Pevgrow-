import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16 border-t border-gray-700">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Logo y descripcion */}
          <div className="lg:col-span-2">
            <div className="mb-5">
              <Image
                src="/api/prestashop/images/general/header"
                alt="Pevgrow"
                width={200}
                height={55}
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-sm">
              Tu growshop de confianza desde 2009. Las mejores semillas de cannabis, fertilizantes y accesorios con envio discreto y gratuito.
            </p>
            {/* Redes sociales */}
            <div className="flex gap-3">
              <a href="https://www.facebook.com/pevgrow" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/pevgrow_oficial" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="https://www.youtube.com/@Pevgrow" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors" aria-label="YouTube">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a href="https://x.com/pevgrow" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors" aria-label="X">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://www.pinterest.es/pevgrow/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors" aria-label="Pinterest">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Informacion */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Informacion</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/sobre-nosotros" className="hover:text-white transition-colors">Sobre nosotros</a></li>
              <li><a href="/opiniones" className="hover:text-white transition-colors">Opiniones</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="/nuevos-productos" className="hover:text-white transition-colors">Novedades</a></li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Ayuda</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/devoluciones" className="hover:text-white transition-colors">Devoluciones</a></li>
              <li><a href="/envio" className="hover:text-white transition-colors">Envio</a></li>
              <li><a href="/centro-ayuda" className="hover:text-white transition-colors">Centro de ayuda</a></li>
              <li><a href="/ofertas" className="hover:text-white transition-colors">Ofertas</a></li>
              <li><a href="/cupones" className="hover:text-white transition-colors">Cupones</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Contacto</h3>
            <p className="text-sm font-medium mb-1">Site of shops online S.L.</p>
            <p className="text-xs text-gray-500 mb-4">CIF B98262777</p>
            <a href="mailto:info@pevgrow.com" className="text-sm text-gray-300 hover:text-white transition-colors">
              info@pevgrow.com
            </a>
          </div>
        </div>
      </div>

      {/* Metodos de pago y copyright */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Pevgrow. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 mr-2">Pago seguro:</span>
              <div className="bg-gray-800 rounded px-2.5 py-1.5 text-xs font-bold text-gray-300">VISA</div>
              <div className="bg-gray-800 rounded px-2.5 py-1.5 text-xs font-bold text-gray-300">Mastercard</div>
              <div className="bg-gray-800 rounded px-2.5 py-1.5 text-xs font-bold text-blue-400">PayPal</div>
              <div className="bg-gray-800 rounded px-2.5 py-1.5 text-xs font-bold text-gray-300">Bizum</div>
              <div className="bg-gray-800 rounded px-2.5 py-1.5 text-xs font-bold text-gray-300">Transferencia</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
