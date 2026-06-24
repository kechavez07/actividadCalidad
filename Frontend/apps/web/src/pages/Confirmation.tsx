import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { soapClient } from '@shared/soap-client';
import type { OrderConfirmation } from '@shared/types';
import { useToast } from '../context/ToastContext';
import { useCart } from '@shared/hooks/useCart';

export default function Confirmation() {
  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const clearCart = useCart(s => s.clearCart);

  useEffect(() => {
    async function processOrder() {
      setLoading(true);
      const raw = sessionStorage.getItem('lastOrder');
      if (!raw) {
        setLoading(false);
        return;
      }

      const orderData: OrderConfirmation = JSON.parse(raw);

      try {
        // Intentar decrementar disponibilidad para cada item
        for (const item of orderData.items) {
          await soapClient.decrementarDisponibilidad(
            item.matchId,
            item.zoneId,
            item.quantity
          );
        }

        // Si todos los decrementos fueron exitosos
        setOrder(orderData);
        sessionStorage.removeItem('lastOrder');
        clearCart();
        setError(null);
      } catch (err) {
        // Error al decrementar inventario
        const msg = err instanceof Error ? err.message : 'No hay inventario disponible';
        setError(msg);
        showToast(`Error: ${msg}`, 'error');
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }

    processOrder();
  }, [clearCart, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-fifa-blue border-t-fifa-gold rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Confirmando compra...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="text-6xl mb-6">❌</div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">Error en la compra</h1>
        <p className="text-red-400 mb-8">{error}</p>
        <Link to="/carrito" className="btn-primary inline-block">
          Volver al carrito
        </Link>
      </div>
    );
  }

  if (!order) return <Navigate to="/" replace />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
      <div className="text-6xl mb-6">✅</div>
      <h1 className="font-display font-bold text-4xl text-white mb-3">¡Compra confirmada!</h1>
      <p className="text-gray-400 mb-2">Número de orden:</p>
      <p className="text-2xl font-display font-bold text-fifa-gold mb-8">{order.orderId}</p>

      <div className="bg-fifa-navy border border-fifa-blue/30 rounded-xl p-6 text-left mb-8">
        <h2 className="font-semibold text-white mb-4">Tus boletos</h2>
        <div className="space-y-4">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between items-start pb-3 border-b border-fifa-blue/20 last:border-0 last:pb-0">
              <div>
                <p className="text-white font-medium text-sm">{item.matchLabel}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(`${item.date}T${item.time}`).toLocaleDateString('es-MX', {
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                  })} · {item.time}
                </p>
                <p className="text-xs text-gray-400">{item.stadiumName}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.zoneName} · Fila {item.row} Asiento {item.seatNumber}
                </p>
              </div>
              <p className="text-fifa-gold font-bold text-sm whitespace-nowrap ml-4">
                ${(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-fifa-blue/20 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white">${order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Cargo servicio</span>
            <span className="text-white">${order.serviceFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-white">Total pagado</span>
            <span className="text-fifa-gold">${order.total.toLocaleString()} USD</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-8">
        Confirmación enviada a <span className="text-gray-300">{order.email}</span> (simulado)
      </p>

      <Link to="/partidos" className="btn-primary inline-block">
        Ver más partidos
      </Link>
    </div>
  );
}
