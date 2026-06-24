import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '@shared/hooks/useCart';
import { useAuth } from '@shared/hooks/useAuth';
import { soapClient } from '@shared/soap-client';
import { calcSubtotal, calcServiceFee, calcTotal } from '@shared/pricing';
import type { Cuota } from '@shared/types';

type Step = 'idle' | 'verificando' | 'rechazado' | 'apto' | 'calculando' | 'confirmando' | 'error';

export default function Checkout() {
  const { items, clearCart } = useCart();
  const isAuthenticated = useAuth(s => s.isAuthenticated());
  const user = useAuth(s => s.user);
  const clearCredito = useAuth(s => s.clearCredito);
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('idle');
  const [cedula, setCedula] = useState(user?.creditoCedula || '');
  const [error, setError] = useState('');
  const [rechazoMotivo, setRechazoMotivo] = useState('');
  const [montoMaximo, setMontoMaximo] = useState(user?.creditoMonto || 0);
  const [plazoMeses, setPlazoMeses] = useState(6);
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [facturaId, setFacturaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Si ya validó crédito en MatchDetail, pasar directo al paso apto
  useEffect(() => {
    if (user?.creditoCedula && user?.creditoMonto && step === 'idle') {
      setCedula(user.creditoCedula);
      setMontoMaximo(user.creditoMonto);
      setStep('apto');
    }
  }, [user, step]);

  if (!isAuthenticated) return <Navigate to="/login?redirect=/pago" replace />;
  if (items.length === 0) return <Navigate to="/carrito" replace />;

  const subtotal = calcSubtotal(items);
  const serviceFee = calcServiceFee(subtotal);
  const totalCompra = calcTotal(subtotal, serviceFee);

  function validarCedula(c: string): boolean {
    return /^\d{10}$/.test(c.replace(/\D/g, ''));
  }

  async function handleVerificar() {
    const cedulaLimpia = cedula.replace(/\D/g, '');
    if (!validarCedula(cedulaLimpia)) {
      setError('Cédula inválida — debe tener 10 dígitos');
      return;
    }

    setLoading(true);
    setError('');
    setStep('verificando');

    try {
      const { apto, motivo } = await soapClient.verificarSujetoCredito(cedulaLimpia);

      if (!apto) {
        setRechazoMotivo(motivo || 'No cumple requisitos de elegibilidad');
        setStep('rechazado');
        setLoading(false);
        return;
      }

      const monto = await soapClient.obtenerMontoMaximo(cedulaLimpia);
      setMontoMaximo(monto);
      setStep('apto');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error del servidor';
      setError(msg);
      setStep('error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCalcularTabla() {
    setLoading(true);
    setError('');
    setStep('calculando');

    try {
      const result = await soapClient.registrarCreditoAmortizacion(
        cedula.replace(/\D/g, ''),
        totalCompra,
        plazoMeses,
      );
      if (!result.exitoso && result.cuotas.length === 0) {
        throw new Error(result.mensaje || 'Error al registrar crédito');
      }
      setFacturaId(result.facturaId ?? `FACT-${Date.now()}`);
      setCuotas(result.cuotas);
      setStep('apto');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error registrando crédito';
      setError(msg);
      setStep('error');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmar() {
    setLoading(true);
    setError('');
    setStep('confirmando');

    const cedulaFinal = cedula.replace(/\D/g, '') || user?.creditoCedula || user?.cedula || '';

    try {
      let fid = facturaId;
      if (!fid || cuotas.length === 0) {
        const credito = await soapClient.registrarCreditoAmortizacion(
          cedulaFinal,
          totalCompra,
          plazoMeses,
        );
        if (!credito.exitoso) {
          throw new Error(credito.mensaje || 'Error al registrar crédito');
        }
        fid = credito.facturaId ?? `FACT-${Date.now()}`;
        setFacturaId(fid);
        setCuotas(credito.cuotas);
      }

      for (const item of items) {
        const confirmacion = await soapClient.confirmarCompraAsiento(
          item.codigoPartido,
          item.zoneId,
          item.seatNumber,
          cedulaFinal,
          fid!,
        );
        if (!confirmacion.exitoso) {
          throw new Error(
            confirmacion.mensaje || `El asiento ${item.seatNumber} ya no está disponible. Vuelva al estadio.`,
          );
        }
      }

      clearCart();
      clearCredito();
      navigate('/confirmacion');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al confirmar compra';
      setError(msg);
      setStep('error');
    } finally {
      setLoading(false);
    }
  }

  function resetear() {
    setStep('idle');
    setError('');
    setRechazoMotivo('');
    setCuotas([]);
    setFacturaId(null);
  }

  return (
    <div className="min-h-screen bg-fifa-dark py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ===== RESUMEN DE ORDEN ===== */}
        <div className="bg-fifa-navy border border-fifa-blue/30 rounded-xl p-6">
          <h2 className="text-xl font-display font-bold text-white mb-4">Resumen de orden</h2>
          <div className="space-y-3 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-start border-b border-fifa-blue/20 pb-2">
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{item.matchLabel}</p>
                  <p className="text-gray-400 text-xs">{item.zoneName} · Fila {item.row} Asiento {item.seatNumber}</p>
                  <p className="text-gray-500 text-xs">x{item.quantity}</p>
                </div>
                <p className="text-fifa-gold font-bold text-sm ml-4">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-fifa-blue/20 pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Cargo por servicio (10%)</span>
              <span className="text-white">${serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-fifa-blue/20">
              <span className="text-white">Total</span>
              <span className="text-fifa-gold">${totalCompra.toFixed(2)} USD</span>
            </div>
          </div>
        </div>

        {/* ===== CÉDULA INPUT (idle + rechazado + error) ===== */}
        {(step === 'idle' || step === 'rechazado' || step === 'error') && (
          <div className="bg-fifa-navy border border-fifa-blue/30 rounded-xl p-6">
            <h3 className="text-lg font-display font-bold text-white mb-4">Pago a crédito</h3>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Cédula</label>
              <input
                type="text"
                value={cedula}
                onChange={e => setCedula(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="1234567890"
                maxLength={10}
                className="w-full px-4 py-3 bg-fifa-darker border border-fifa-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fifa-gold"
              />
            </div>

            {step === 'rechazado' && (
              <div className="bg-red-900/30 border border-red-500/40 rounded-lg p-4 mb-4">
                <p className="text-red-300 font-semibold text-sm">No apto para crédito</p>
                <p className="text-red-400 text-xs mt-1">{rechazoMotivo}</p>
              </div>
            )}

            {step === 'error' && (
              <div className="bg-red-900/30 border border-red-500/40 rounded-lg p-4 mb-4">
                <p className="text-red-300 font-semibold text-sm">Error</p>
                <p className="text-red-400 text-xs mt-1 break-all">{error}</p>
              </div>
            )}

            {error && step === 'idle' && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            <button
              onClick={handleVerificar}
              disabled={cedula.replace(/\D/g, '').length !== 10}
              className="w-full bg-fifa-gold hover:bg-yellow-500 text-fifa-darker font-bold py-3 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        )}

        {/* ===== VERIFICANDO ===== */}
        {step === 'verificando' && (
          <div className="bg-fifa-navy border border-fifa-blue/30 rounded-xl p-6 text-center">
            <div className="w-10 h-10 border-4 border-fifa-blue border-t-fifa-gold rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Verificando elegibilidad de crédito...</p>
          </div>
        )}

        {/* ===== APTO + CUPO + PLAZO + TABLA ===== */}
        {step === 'apto' && (
          <div className="bg-fifa-navy border border-fifa-blue/30 rounded-xl p-6">
            <h3 className="text-lg font-display font-bold text-white mb-4">Crédito aprobado</h3>

            <div className="bg-green-900/30 border border-green-500/40 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 font-semibold">Cupo máximo disponible</p>
                  <p className="text-green-400 text-2xl font-bold mt-1">${montoMaximo.toFixed(2)} USD</p>
                </div>
                <button
                  onClick={() => { clearCredito(); resetear(); setCedula(''); }}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Cambiar cédula
                </button>
              </div>
              <p className="text-green-400/60 text-xs mt-2">Cédula: {cedula}</p>
            </div>

            {totalCompra > montoMaximo ? (
              <div className="bg-yellow-900/30 border border-yellow-500/40 rounded-lg p-4 mb-4">
                <p className="text-yellow-300 font-semibold">Cupo insuficiente</p>
                <p className="text-yellow-400 text-sm mt-1">
                  El total de la compra (${totalCompra.toFixed(2)}) supera tu cupo disponible
                  (${montoMaximo.toFixed(2)}).
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-green-400 font-bold text-lg">✓</span>
                  <p className="text-green-300 text-sm">
                    Total (${totalCompra.toFixed(2)}) dentro del cupo disponible
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Plazo en meses</label>
                  <div className="flex gap-2">
                    {[3, 6, 9, 12, 15, 18].map(m => (
                      <button
                        key={m}
                        onClick={() => setPlazoMeses(m)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          plazoMeses === m
                            ? 'bg-fifa-gold text-fifa-darker'
                            : 'bg-fifa-darker border border-fifa-blue/30 text-gray-300 hover:border-fifa-gold'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                {cuotas.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-white font-semibold text-sm mb-3">
                      Tabla de amortización ({plazoMeses} meses · 16.5% anual)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-fifa-blue/20 text-gray-400 text-xs uppercase">
                            <th className="px-2 py-2 text-left">#</th>
                            <th className="px-2 py-2 text-right">Cuota</th>
                            <th className="px-2 py-2 text-right">Interés</th>
                            <th className="px-2 py-2 text-right">Capital</th>
                            <th className="px-2 py-2 text-right">Saldo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cuotas.map(c => (
                            <tr key={c.numero} className="border-b border-fifa-blue/10 text-gray-300">
                              <td className="px-2 py-2">{c.numero}</td>
                              <td className="px-2 py-2 text-right">${c.valorCuota.toFixed(2)}</td>
                              <td className="px-2 py-2 text-right text-red-400">${c.interes.toFixed(2)}</td>
                              <td className="px-2 py-2 text-right text-green-400">${c.capital.toFixed(2)}</td>
                              <td className="px-2 py-2 text-right">${c.saldo.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {cuotas.length === 0 ? (
                    <button
                      onClick={handleCalcularTabla}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-40"
                    >
                      {loading ? 'Calculando...' : `Calcular tabla (${plazoMeses} meses)`}
                    </button>
                  ) : (
                    <button
                      onClick={handleConfirmar}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-40"
                    >
                      Confirmar compra
                    </button>
                  )}
                </div>
              </>
            )}

            <button
              onClick={resetear}
              disabled={loading}
              className="w-full text-gray-400 hover:text-white text-sm py-2 mt-3 transition-colors disabled:opacity-40"
            >
              Volver
            </button>
          </div>
        )}

        {/* ===== CALCULANDO ===== */}
        {step === 'calculando' && (
          <div className="bg-fifa-navy border border-fifa-blue/30 rounded-xl p-6 text-center">
            <div className="w-10 h-10 border-4 border-fifa-blue border-t-fifa-gold rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Generando tabla de amortización...</p>
          </div>
        )}

        {/* ===== CONFIRMANDO ===== */}
        {step === 'confirmando' && (
          <div className="bg-fifa-navy border border-fifa-blue/30 rounded-xl p-6 text-center">
            <div className="w-10 h-10 border-4 border-fifa-blue border-t-fifa-gold rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Confirmando compra y reservando asientos...</p>
          </div>
        )}
      </div>
    </div>
  );
}
