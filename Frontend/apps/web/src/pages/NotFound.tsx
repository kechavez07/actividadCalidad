import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-display font-bold text-fifa-gold/20 select-none">404</p>
        <h1 className="font-display font-bold text-3xl text-white mt-4 mb-3">Página no encontrada</h1>
        <p className="text-gray-400 mb-8">La página que buscas no existe o fue movida.</p>
        <Link to="/" className="btn-primary inline-block">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
