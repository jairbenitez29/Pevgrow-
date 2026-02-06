export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16 border-t-4 border-purple-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Información */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Información</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/sobre-nosotros" className="hover:text-purple-400 transition-colors font-medium">Sobre nosotros</a></li>
              <li><a href="/opiniones" className="hover:text-purple-400 transition-colors font-medium">Opiniones</a></li>
              <li><a href="/blog" className="hover:text-purple-400 transition-colors font-medium">Blog</a></li>
            </ul>
          </div>

          {/* Te interesa */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Te interesa</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/nuevos-productos" className="hover:text-purple-400 transition-colors font-medium">Productos nuevos</a></li>
              <li><a href="/ofertas" className="hover:text-purple-400 transition-colors font-medium">Mejores ofertas</a></li>
              <li><a href="/cupones" className="hover:text-purple-400 transition-colors font-medium">Cupones</a></li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Información y ayuda</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/devoluciones" className="hover:text-purple-400 transition-colors font-medium">Devoluciones</a></li>
              <li><a href="/envio" className="hover:text-purple-400 transition-colors font-medium">Envío</a></li>
              <li><a href="/centro-ayuda" className="hover:text-purple-400 transition-colors font-medium">Centro de ayuda</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contacto</h3>
            <p className="text-sm font-medium mb-2">
              Site of shops online S.L.
            </p>
            <p className="text-sm text-gray-400 mb-4">
              CIF B98262777
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors font-medium text-sm">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors font-medium text-sm">
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 text-center text-sm">
          <p className="text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} Pevgrow. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
