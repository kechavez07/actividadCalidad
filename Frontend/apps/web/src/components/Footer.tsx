import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-fifa-darker border-t border-fifa-blue/20 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-sm font-display font-bold text-white">
              Ticket<span className="text-fifa-gold">Premium</span> FIFA 2026
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Demo — autenticación y pagos son completamente simulados. No se procesan datos reales.
            </p>
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link to="/partidos" className="hover:text-gray-300 transition-colors">Partidos</Link>
            <Link to="/carrito" className="hover:text-gray-300 transition-colors">Carrito</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
