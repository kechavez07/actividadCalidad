import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@shared/hooks/useAuth';
import { soapClient } from '@shared/soap-client';

export default function PreAprobacion() {
  const user = useAuth(s => s.user);
  const setEsApto = useAuth(s => s.setEsApto);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ apto: boolean; motivo?: string } | null>(null);
  const [error, setError] = useState('');

  if (!user || !user.cedula) {
    return <Navigate to="/login?redirect=/pre-aprobacion" replace />;
  }

  async function handleVerificar() {
    if (!user?.cedula) {
      setError('Cédula no disponible');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { apto, motivo } = await soapClient.verificarSujetoCredito(user.cedula);
      setEsApto(apto);
      setResult({ apto, motivo: motivo || undefined });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error verificando elegibilidad';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleVerCupo() {
    navigate('/cupo-disponible');
  }

  function handlePagarContado() {
    navigate('/pago');
  }

  function handleReintentar() {
    setResult(null);
    setError('');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-bold text-3xl text-white mb-2">Verificación de Elegibilidad</h1>
      <p className="text-gray-400 mb-8">Verifica tu elegibilidad para financiamiento de boletos</p>

      <div className="bg-fifa-navy border border-fifa-blue/30 rounded-xl p-8">
        {/* Header con cédula */}
        <div className="mb-8 pb-6 border-b border-fifa-blue/20">
          <p className="text-sm text-gray-400 mb-1">Cédula registrada</p>
          <p className="font-mono text-xl text-fifa-gold font-semibold">{user.cedula}</p>
        </div>

        {/* Estado: Sin verificar */}
        {result === null && !error && (
          <div className="text-center">
            <p className="text-gray-300 mb-8">
              Haz clic en el botón para verificar tu elegibilidad de crédito.
            </p>
            <button
              onClick={handleVerificar}
              disabled={loading}
              className="btn-primary px-8 py-3"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⌛</span>
                  Verificando elegibilidad...
                </>
              ) : (
                'Verificar Elegibilidad'
              )}
            </button>
          </div>
        )}

        {/* Estado: Apto */}
        {result?.apto && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="bg-green-500/20 border border-green-500/50 rounded-full w-16 h-16 flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-green-400 mb-2">¡Eres Elegible!</p>
            <p className="text-gray-400 mb-8">Cumples los requisitos para obtener financiamiento</p>
            <button
              onClick={handleVerCupo}
              className="btn-primary px-8 py-3"
            >
              Ver Cupo Disponible
            </button>
          </div>
        )}

        {/* Estado: Rechazado */}
        {result?.apto === false && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="bg-red-500/20 border border-red-500/50 rounded-full w-16 h-16 flex items-center justify-center">
                <span className="text-3xl">✕</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-red-400 mb-2">No Eres Elegible</p>
            <p className="text-gray-400 mb-2">{result.motivo}</p>
            <p className="text-sm text-gray-500 mb-8">Puedes continuar pagando al contado</p>
            <button
              onClick={handlePagarContado}
              className="btn-primary px-8 py-3"
            >
              Pagar al Contado
            </button>
          </div>
        )}

        {/* Estado: Error */}
        {error && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="bg-red-500/20 border border-red-500/50 rounded-full w-16 h-16 flex items-center justify-center">
                <span className="text-3xl">!</span>
              </div>
            </div>
            <p className="text-lg font-semibold text-red-400 mb-2">Error al Verificar</p>
            <p className="text-gray-400 mb-8">{error}</p>
            <button
              onClick={handleReintentar}
              className="btn-primary px-8 py-3"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
