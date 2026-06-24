import { useState, useMemo, useEffect } from 'react';
import { stadiums } from '@shared/data/stadiums';
import { soapClient } from '@shared/soap-client';
import type { PartidoSOAP } from '@shared/soap-client';

export default function Matches() {
  const [cityFilter, setCityFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partidos, setPartidos] = useState<PartidoSOAP[]>([]);

  useEffect(() => {
    async function loadPartidos() {
      setLoading(true);
      setError('');
      try {
        const data = await soapClient.getPartidosDisponibles();
        setPartidos(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error del servidor';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    loadPartidos();
  }, []);

  const cities = useMemo(() => [...new Set(stadiums.map(s => s.city))].sort(), []);

  const filtered = useMemo(() => {
    return partidos.filter(p => {
      if (cityFilter && p.ciudad !== cityFilter) return false;
      if (dateFilter && p.fecha !== dateFilter) return false;
      if (teamFilter) {
        const q = teamFilter.toLowerCase();
        if (!p.equipoLocal.toLowerCase().includes(q) && !p.equipoVisita.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [partidos, cityFilter, dateFilter, teamFilter]);

  function resetFilters() {
    setCityFilter('');
    setTeamFilter('');
    setDateFilter('');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-fifa-blue border-t-fifa-gold rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando partidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-3">Error al cargar partidos</p>
          <p className="text-gray-500 text-sm mb-6 font-mono">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl text-white">Partidos</h1>
        <p className="text-gray-400 mt-2">Fase de grupos · {partidos.length} partidos disponibles</p>
      </div>

      {/* Filtros */}
      <div className="bg-fifa-navy border border-fifa-blue/30 rounded-xl p-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Ciudad</label>
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="input-field text-sm"
            >
              <option value="">Todas las ciudades</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Equipo</label>
            <input
              type="text"
              placeholder="Buscar equipo..."
              value={teamFilter}
              onChange={e => setTeamFilter(e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Fecha</label>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="input-field text-sm"
            />
          </div>
        </div>
        {(cityFilter || teamFilter || dateFilter) && (
          <button onClick={resetFilters} className="mt-3 text-xs text-fifa-gold hover:underline">
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Resultados */}
      <p className="text-sm text-gray-400 mb-4">
        {filtered.length} {filtered.length === 1 ? 'partido' : 'partidos'} encontrados
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-3">No hay partidos con esos filtros</p>
          <button onClick={resetFilters} className="btn-secondary text-sm">
            Mostrar todos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(partido => (
            <a
              key={`${partido.codigo}-${partido.equipoLocal}`}
              href={`/partidos/${partido.codigo}`}
            >
              <div className="card group cursor-pointer hover:scale-[1.01] transition-transform duration-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400">{partido.estadio}</span>
                </div>

                <div className="flex items-center justify-between gap-2 my-4">
                  <div className="flex-1 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-fifa-blue/40 flex items-center justify-center mb-2 group-hover:bg-fifa-blue/60 transition-colors">
                      <span className="text-lg font-bold">{partido.equipoLocal.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <p className="text-sm font-semibold text-white leading-tight">{partido.equipoLocal}</p>
                  </div>

                  <div className="text-center px-2">
                    <p className="text-lg font-display font-bold text-fifa-gold">VS</p>
                    <p className="text-xs text-gray-500 mt-1">{partido.hora}</p>
                  </div>

                  <div className="flex-1 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-fifa-blue/40 flex items-center justify-center mb-2 group-hover:bg-fifa-blue/60 transition-colors">
                      <span className="text-lg font-bold">{partido.equipoVisita.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <p className="text-sm font-semibold text-white leading-tight">{partido.equipoVisita}</p>
                  </div>
                </div>

                <div className="border-t border-fifa-blue/20 pt-3 text-xs text-gray-400">
                  <p>{new Date(`${partido.fecha}T${partido.hora}`).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  <p>{partido.estadio}, {partido.ciudad}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
