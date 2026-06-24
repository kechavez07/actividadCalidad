import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resolveStadiumForPartido, getZoneForSector } from '@shared/data/stadiums';
import { soapClient } from '@shared/soap-client';
import type { PartidoSOAP, LocalidadSOAP } from '@shared/soap-client';
import type { Zone, Seat } from '@shared/types';
import { useCart } from '@shared/hooks/useCart';
import { useAuth } from '@shared/hooks/useAuth';
import StadiumSelectorSVG from '../components/StadiumSelectorSVG';
import { useToast } from '../context/ToastContext';
import NotFound from './NotFound';

type CreditStep = 'idle' | 'verificando' | 'rechazado' | 'aprobado';

interface CreditValidationCache {
  cedula: string;
  monto: number;
  timestamp: number;
}

const VALIDATION_TIMEOUT = 30 * 60 * 1000; // 30 minutos
const STORAGE_KEY = 'ticketpremium-credit-validation';

function loadValidationFromCache(): CreditValidationCache | null {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const data = JSON.parse(stored) as CreditValidationCache;
    const now = Date.now();
    if (now - data.timestamp < VALIDATION_TIMEOUT) {
      return data;
    }
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveValidationToCache(cedula: string, monto: number) {
  const data: CreditValidationCache = {
    cedula,
    monto,
    timestamp: Date.now(),
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearValidationFromCache() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const addItem = useCart(s => s.addItem);
  const user = useAuth(s => s.user);
  const setCreditoCedula = useAuth(s => s.setCreditoCedula);
  const setCreditoMonto = useAuth(s => s.setCreditoMonto);
  const setEsApto = useAuth(s => s.setEsApto);

  const [loading, setLoading] = useState(true);
  const [partido, setPartido] = useState<PartidoSOAP | null>(null);
  const [localidades, setLocalidades] = useState<LocalidadSOAP[]>([]);
  const [soapError, setSoapError] = useState<string | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  const [creditStep, setCreditStep] = useState<CreditStep>('idle');
  const [creditCedula, setCreditCedula] = useState('');
  const [creditMonto, setCreditMonto] = useState(0);
  const [creditError, setCreditError] = useState('');
  const [rechazoMotivo, setRechazoMotivo] = useState('');
  const [creditLoading, setCreditLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      soapClient.getPartidosDisponibles().then(partidos => {
        const p = partidos.find(pa => pa.codigo === id);
        if (!p) throw new Error('Partido no encontrado');
        setPartido(p);
        return p;
      }),
      soapClient.getLocalidadesPorPartido(id).then(locs => {
        setLocalidades(locs);
      }).catch(err => {
        const msg = err instanceof Error ? err.message : 'Error';
        setSoapError(msg);
      }),
    ]).catch(err => {
      setSoapError(err instanceof Error ? err.message : 'Error al cargar datos del partido');
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const cached = loadValidationFromCache();
    if (cached) {
      setCreditCedula(cached.cedula);
      setCreditMonto(cached.monto);
      setCreditStep('aprobado');
      setCreditoCedula(cached.cedula);
      setCreditoMonto(cached.monto);
      setEsApto(true);
    }
  }, [setCreditoCedula, setCreditoMonto, setEsApto]);

  if (!id) return <NotFound />;
  const codigoPartido = id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-fifa-blue border-t-fifa-gold rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando partido...</p>
        </div>
      </div>
    );
  }

  if (!partido) return <NotFound />;

  const p = partido;

  const stadium = resolveStadiumForPartido(p);

  const formattedDate = (() => {
    const raw = p.fecha.includes('T') ? p.fecha : p.fecha.replace(' ', 'T');
    const parsed = new Date(`${raw.split('T')[0]}T${p.hora}`);
    if (Number.isNaN(parsed.getTime())) return p.fecha;
    return parsed.toLocaleDateString('es-MX', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  })();

  function handleSectorSelect(sectorId: string, zoneId: string, zoneName: string, price: number) {
    if (!sectorId) {
      setSelectedSectorId(null);
      setSelectedZone(null);
      return;
    }

    setSelectedSectorId(sectorId);
    const resolvedZone = stadium ? getZoneForSector(stadium, sectorId) : null;
    if (resolvedZone) {
      const localidad = localidades.find(l => l.codigo === resolvedZone.id);
      if (!localidad) {
        showToast(`La localidad ${resolvedZone.name} no está disponible en este partido`, 'error');
        setSelectedSectorId(null);
        setSelectedZone(null);
        return;
      }
      setSelectedZone({ ...resolvedZone, price: localidad.precio });
    } else {
      setSelectedZone(null);
    }
    setSelectedSeats([]);
  }

  async function handleSeatsSelect(seats: Seat[], sectorId: string) {
    if (seats.length === 0 || !selectedZone) return;

    seats.forEach((seat) => {
      addItem({
        matchId: codigoPartido,
        matchLabel: `${p.equipoLocal} vs ${p.equipoVisita}`,
        stadiumName: p.estadio,
        date: p.fecha,
        time: p.hora,
        zoneId: selectedZone!.id,
        zoneName: selectedZone!.name,
        codigoPartido,
        row: seat.row,
        seatNumber: seat.number,
        price: selectedZone!.price,
        quantity: 1,
      });
    });

    showToast(`${seats.length} asiento(s) agregado(s) al carrito`, 'success');
    setSelectedSeats([]);
    setSelectedSectorId(null);
    setSelectedZone(null);
  }

  async function handleValidarCredito() {
    const cedulaLimpia = creditCedula.replace(/\D/g, '');
    if (cedulaLimpia.length !== 10) {
      setCreditError('La cédula debe tener 10 dígitos');
      return;
    }

    setCreditLoading(true);
    setCreditError('');
    setRechazoMotivo('');
    setCreditStep('verificando');

    try {
      const { apto, motivo } = await soapClient.verificarSujetoCredito(cedulaLimpia);

      if (!apto) {
        setRechazoMotivo(motivo || 'No cumple requisitos de elegibilidad');
        setCreditStep('rechazado');
        setCreditLoading(false);
        return;
      }

      const monto = await soapClient.obtenerMontoMaximo(cedulaLimpia);
      setCreditMonto(monto);
      setCreditStep('aprobado');
      setCreditoCedula(cedulaLimpia);
      setCreditoMonto(monto);
      setEsApto(true);
      saveValidationToCache(cedulaLimpia, monto);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error del servidor';
      setCreditError(msg);
      setCreditStep('idle');
    } finally {
      setCreditLoading(false);
    }
  }

  function handleResetCredit() {
    setCreditStep('idle');
    setCreditError('');
    setRechazoMotivo('');
    setCreditMonto(0);
    setCreditCedula('');
    clearValidationFromCache();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header del partido (desde SOAP) */}
      <div className="bg-fifa-navy border border-fifa-blue/30 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-400">{partido.codigo}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-fifa-blue/40 flex items-center justify-center mb-3">
              <span className="text-3xl font-bold">{partido.equipoLocal.slice(0, 2).toUpperCase()}</span>
            </div>
            <h2 className="text-xl font-display font-bold text-white">{partido.equipoLocal}</h2>
          </div>

          <div className="text-center">
            <p className="text-3xl font-display font-bold text-fifa-gold">VS</p>
            <p className="text-sm text-gray-400 mt-1">{partido.hora} hrs</p>
          </div>

          <div className="flex-1 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-fifa-blue/40 flex items-center justify-center mb-3">
              <span className="text-3xl font-bold">{partido.equipoVisita.slice(0, 2).toUpperCase()}</span>
            </div>
            <h2 className="text-xl font-display font-bold text-white">{partido.equipoVisita}</h2>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-fifa-blue/20 flex flex-wrap gap-4 text-sm text-gray-300">
          <span>{formattedDate}</span>
          <span>{partido.estadio}</span>
          <span>{partido.ciudad}</span>
        </div>
      </div>

      {soapError && (
        <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-3 mb-6">
          <p className="text-red-300 text-sm font-semibold">Error del servidor</p>
          <p className="text-red-400 text-xs mt-1 font-mono break-all">{soapError}</p>
        </div>
      )}

      {/* Validación de crédito */}
      {(creditStep === 'idle' || creditStep === 'rechazado') && (
        <div className="bg-fifa-navy border border-fifa-blue/30 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-display font-bold text-white mb-4">Validar crédito</h3>
          <p className="text-gray-400 text-sm mb-4">Ingresa tu cédula para verificar si eres apto para crédito antes de seleccionar asientos.</p>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Cédula</label>
            <input
              type="text"
              value={creditCedula}
              onChange={e => setCreditCedula(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="1234567890"
              maxLength={10}
              className="w-full px-4 py-3 bg-fifa-darker border border-fifa-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fifa-gold"
            />
          </div>

          {creditStep === 'rechazado' && (
            <div className="bg-red-900/30 border border-red-500/40 rounded-lg p-4 mb-4">
              <p className="text-red-300 font-semibold text-sm">No apto para crédito</p>
              <p className="text-red-400 text-xs mt-1">{rechazoMotivo}</p>
            </div>
          )}

          {creditError && <p className="text-red-400 text-sm mb-4">{creditError}</p>}

          <button
            onClick={handleValidarCredito}
            disabled={creditCedula.replace(/\D/g, '').length !== 10 || creditLoading}
            className="w-full bg-fifa-gold hover:bg-yellow-500 text-fifa-darker font-bold py-3 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {creditLoading ? 'Verificando...' : 'Verificar cédula'}
          </button>
        </div>
      )}

      {creditStep === 'verificando' && (
        <div className="bg-fifa-navy border border-fifa-blue/30 rounded-xl p-6 mb-8 text-center">
          <div className="w-10 h-10 border-4 border-fifa-blue border-t-fifa-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Verificando elegibilidad de crédito...</p>
        </div>
      )}

      {creditStep === 'aprobado' && (
        <div className="bg-green-900/30 border border-green-500/40 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-green-300 font-semibold text-sm">✓ Crédito aprobado</p>
            <p className="text-green-400 text-lg font-bold">Cupo: ${creditMonto.toFixed(2)} USD</p>
          </div>
          <button onClick={handleResetCredit} className="text-xs text-gray-400 hover:text-white transition-colors">
            Cambiar cédula
          </button>
        </div>
      )}

      {/* Stadium selector */}
      {creditStep !== 'aprobado' ? (
        <div className="bg-fifa-navy/50 border border-fifa-blue/20 rounded-xl p-8 mb-8 text-center">
          <p className="text-gray-500 text-lg">Valida tu crédito para seleccionar asientos</p>
          <p className="text-gray-600 text-sm mt-2">Ingresa tu cédula arriba y verifica tu elegibilidad primero</p>
        </div>
      ) : stadium ? (
        <>
          <h3 className="font-display font-bold text-xl text-white mb-4">Selecciona tu zona y asientos</h3>
          <StadiumSelectorSVG
            stadium={stadium}
            codigoPartido={codigoPartido}
            cedulaCliente={creditCedula || user?.creditoCedula || null}
            clienteNombre={user?.name || 'Cliente'}
            selectedSectorId={selectedSectorId}
            selectedZone={selectedZone}
            onSectorSelect={handleSectorSelect}
            onSeatsSelect={handleSeatsSelect}
            onNotify={(message, type = 'error') => showToast(message, type)}
          />
        </>
      ) : (
        <div className="bg-yellow-900/30 border border-yellow-500/40 rounded-lg p-4 mb-6">
          <p className="text-yellow-300 text-sm">No hay información del estadio para este partido</p>
          <p className="text-yellow-400 text-xs mt-1">
            Lugar SOAP: {p.estadio} · {p.ciudad}
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button onClick={() => navigate('/carrito')} className="bg-fifa-gold hover:bg-yellow-500 text-fifa-darker font-bold py-3 px-8 rounded-lg text-lg transition-colors">
          Ver carrito
        </button>
      </div>
    </div>
  );
}
