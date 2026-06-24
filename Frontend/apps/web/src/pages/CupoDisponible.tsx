import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@shared/hooks/useAuth';
import { useCart } from '@shared/hooks/useCart';
import { soapClient } from '@shared/soap-client';

export default function CupoDisponible() {
  const user = useAuth(s => s.user);
  const setCupoMaximo = useAuth(s => s.setCupoMaximo);
  const { total } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [cupo, setCupo] = useState<number | null>(null);
  const [error, setError] = useState('');

  if (!user || !user.cedula) {
    return <Navigate to="/login?redirect=/cupo-disponible" replace />;
  }

  const totalOrder = total();
  const cupoExcedido = cupo !== null && totalOrder > cupo;

  useEffect(() => {
    async function fetchCupo() {
      if (!user?.cedula) {
        setError('Cédula no disponible');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const monto = await soapClient.obtenerMontoMaximo(user.cedula);
        setCupo(monto);
        setCupoMaximo(monto);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error obteniendo cupo';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchCupo();
  }, [user?.cedula, setCupoMaximo]);

  function handleContinuar() {
    navigate('/pago');
  }

  function handleReducir() {
    navigate('/carrito');
  }

  function handleReintentar() {
    setError('');
    setCupo(null);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-bold text-3xl text-white mb-2">Cupo Disponible</h1>
      <p className="text-gray-400 mb-8">Verifica tu límite de crédito disponible</p>

      <div className="bg-fifa-navy border border-fifa-blue/30 rounded-xl p-8">
        {/* Cédula */}
        <div className="mb-8 pb-6 border-b border-fifa-blue/20">
          <p className="text-sm text-gray-400 mb-1">Cédula registrada</p>
          <p className="font-mono text-lg text-fifa-gold font-semibold">{user.cedula}</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin mr-2">⌛</div>
            <p className="text-gray-400">Obteniendo tu cupo disponible...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-8">
            <div className="mb-4 flex justify-center">
              <div className="bg-red-500/20 border border-red-500/50 rounded-full w-14 h-14 flex items-center justify-center">
                <span className="text-2xl">!</span>
              </div>
            </div>
            <p className="text-lg font-semibold text-red-400 mb-2">Error</p>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleReintentar}
              className="btn-primary px-6 py-2"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Cupo válido */}
        {cupo !== null && !loading && !error && (
          <div>
            {/* Cupo máximo */}
            <div className="mb-8 p-6 bg-fifa-blue/10 border border-fifa-blue/30 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Tu cupo máximo</p>
              <p className="text-4xl font-bold text-fifa-gold">
                ${cupo.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Total del carrito */}
            <div className="mb-8 p-6 bg-fifa-navy border border-fifa-blue/20 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-400">Total de tu orden</p>
                <p className="text-2xl font-bold text-white">
                  ${totalOrder.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-400">Disponible para financiar</p>
                <p className={`text-lg font-semibold ${cupoExcedido ? 'text-red-400' : 'text-green-400'}`}>
                  ${Math.max(0, cupo - totalOrder).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Validación */}
            {cupoExcedido ? (
              <div className="text-center py-8 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-lg font-semibold text-red-400 mb-2">Cupo Insuficiente</p>
                <p className="text-gray-400 mb-6">
                  Tu orden excede tu cupo máximo. Por favor reduce la cantidad de boletos.
                </p>
                <button
                  onClick={handleReducir}
                  className="btn-primary px-8 py-3"
                >
                  Reducir Carrito
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 mb-6">Tu orden está dentro del cupo disponible</p>
                <button
                  onClick={handleContinuar}
                  className="btn-primary px-8 py-3 w-full sm:w-auto"
                >
                  Continuar al Pago
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
