import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@shared/hooks/useCart';
import { useAuth } from '@shared/hooks/useAuth';
import { soapClient } from '@shared/soap-client';

export default function Cart() {
  const { items, removeItem, subtotal, serviceFee, total, clearCart } = useCart();
  const isAuthenticated = useAuth(s => s.isAuthenticated());
  const user = useAuth(s => s.user);
  const navigate = useNavigate();

  function handleCheckout() {
    if (!isAuthenticated) {
      navigate('/login?redirect=/pago');
    } else {
      navigate('/pago');
    }
  }

  async function handleRemove(itemId: string) {
    const item = items.find(i => i.id === itemId);
    const cedula = user?.cedula;
    if (item && cedula) {
      await soapClient.liberarAsiento(
        item.codigoPartido,
        item.zoneId,
        item.seatNumber,
        cedula,
      );
    }
    removeItem(itemId);
  }

  async function handleClear() {
    if (user?.cedula) {
      await Promise.allSettled(
        items.map(item =>
          soapClient.liberarAsiento(
            item.codigoPartido,
            item.zoneId,
            item.seatNumber,
            user.cedula!,
          )
        )
      );
    }
    clearCart();
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="text-6xl mb-6">🎟</div>
        <h1 className="font-display font-bold text-3xl text-white mb-3">Tu carrito está vacío</h1>
        <p className="text-gray-400 mb-8">Explora los partidos y elige tus boletos favoritos</p>
        <Link to="/partidos" className="btn-primary inline-block">
          Explorar partidos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-3xl text-white">Carrito</h1>
        <button onClick={handleClear} className="text-sm text-red-400 hover:text-red-300 transition-colors">
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-fifa-navy border border-fifa-blue/30 rounded-xl p-5">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm mb-1">{item.matchLabel}</h3>
                  <p className="text-xs text-gray-400">
                    {new Date(`${item.date}T${item.time}`).toLocaleDateString('es-MX', {
                      weekday: 'short', day: 'numeric', month: 'short',
                    })} · {item.time} hrs
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.stadiumName}</p>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors text-lg leading-none"
                  aria-label="Eliminar boleto"
                >
                  ×
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-fifa-blue/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Zona</p>
                  <p className="text-white font-medium">{item.zoneName.split(' ')[0]}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fila / Asiento</p>
                  <p className="text-white font-medium">{item.row} / {item.seatNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Precio/u.</p>
                  <p className="text-white font-medium">${item.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Cantidad</p>
                  <p className="text-fifa-gold font-bold">{item.quantity}</p>
                </div>
              </div>

              <div className="mt-2 text-right">
                <span className="text-sm text-fifa-gold font-semibold">
                  ${(item.price * item.quantity).toLocaleString()} USD
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div>
          <div className="bg-fifa-navy border border-fifa-blue/30 rounded-xl p-5 sticky top-24">
            <h2 className="font-display font-bold text-lg text-white mb-4">Resumen</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">${subtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cargo de servicio (10%)</span>
                <span className="text-white">${serviceFee().toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-fifa-blue/20 pt-3 mt-3">
                <span className="font-bold text-white">Total</span>
                <span className="font-bold text-fifa-gold text-lg">${total().toLocaleString()}</span>
              </div>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full mt-5">
              Continuar al pago
            </button>
            <Link to="/partidos" className="block text-center text-xs text-gray-500 hover:text-gray-300 mt-3 transition-colors">
              Seguir explorando partidos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
