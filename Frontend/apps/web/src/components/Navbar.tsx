import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '@shared/hooks/useCart';
import { useAuth } from '@shared/hooks/useAuth';

export default function Navbar() {
  const itemCount = useCart(s => s.itemCount());
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="bg-fifa-darker/90 backdrop-blur-sm border-b border-fifa-blue/30 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
            <span className="text-fifa-darker font-display font-bold text-xs">TP</span>
          </div>
          <span className="font-display font-bold text-lg text-white hidden sm:block">
            Ticket<span className="text-fifa-gold">Premium</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-6">
          <NavLink
            to="/partidos"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-fifa-gold' : 'text-gray-300 hover:text-white'}`
            }
          >
            Partidos
          </NavLink>

          <NavLink
            to="/carrito"
            className={({ isActive }) =>
              `relative text-sm font-medium transition-colors ${isActive ? 'text-fifa-gold' : 'text-gray-300 hover:text-white'}`
            }
          >
            Carrito
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-fifa-gold text-fifa-darker text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </NavLink>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-fifa-silver hidden sm:block">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-fifa-gold' : 'text-gray-300 hover:text-white'}`
              }
            >
              Ingresar
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
