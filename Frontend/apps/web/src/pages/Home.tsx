import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { soapClient } from '@shared/soap-client';
import type { PartidoSOAP } from '@shared/soap-client';
import { stadiums } from '@shared/data/stadiums';
import MatchCard from '../components/MatchCard';

export default function Home() {
  const [query, setQuery] = useState('');
  const [partidos, setPartidos] = useState<PartidoSOAP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    soapClient.getPartidosDisponibles()
      .then(data => setPartidos(data))
      .catch(() => setPartidos([]))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = useMemo(() => {
    if (loading) return [];
    const today = new Date().toISOString().split('T')[0];
    return partidos.filter(p => p.fecha >= today).slice(0, 6);
  }, [partidos, loading]);

  const filtered = useMemo(() => {
    if (!query.trim()) return upcoming;
    const q = query.toLowerCase();
    return upcoming.filter(p => {
      const stadium = stadiums.find(s => p.ciudad && s.city.toLowerCase() === p.ciudad.toLowerCase());
      return (
        p.equipoLocal.toLowerCase().includes(q) ||
        p.equipoVisita.toLowerCase().includes(q) ||
        stadium?.city.toLowerCase().includes(q) ||
        p.estadio.toLowerCase().includes(q)
      );
    });
  }, [query, upcoming]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-fifa-darker via-fifa-navy to-fifa-blue opacity-90" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(201,162,39,0.1) 40px, rgba(201,162,39,0.1) 41px)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
          <p className="text-fifa-gold font-semibold text-sm uppercase tracking-widest mb-3">Mundial FIFA 2026</p>
          <h1 className="font-display font-bold text-5xl sm:text-7xl text-white mb-4 leading-tight">
            Vive el <span className="text-fifa-gold">Mundial</span>
            <br />en el estadio
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto mb-10">
            Elige tu partido, selecciona tu zona y asiento, y vive la experiencia única del fútbol más grande del planeta.
          </p>

          <div className="flex max-w-lg mx-auto gap-3">
            <input
              type="text"
              placeholder="Buscar equipo o estadio..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input-field flex-1"
              aria-label="Buscar partidos"
            />
            <Link to="/partidos" className="btn-primary whitespace-nowrap">
              Ver todos
            </Link>
          </div>
        </div>
      </section>

      {/* Próximos partidos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-2xl text-white">
            {query ? 'Resultados' : 'Próximos partidos'}
          </h2>
          <Link to="/partidos" className="text-fifa-gold text-sm hover:underline">
            Ver todos los partidos →
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-12">Cargando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-12">
            {query ? `No se encontraron partidos para "${query}"` : 'No hay partidos disponibles'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => {
              const stadium = stadiums.find(s => p.ciudad && s.city.toLowerCase() === p.ciudad.toLowerCase());
              return <MatchCard key={p.codigo} partido={p} stadium={stadium || null} />;
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-gradient-to-r from-fifa-navy to-fifa-blue rounded-2xl p-8 text-center border border-fifa-gold/20">
          <h3 className="font-display font-bold text-3xl text-white mb-3">Partidos FIFA 2026</h3>
          <p className="text-gray-300 mb-6">Fase de grupos</p>
          <Link to="/partidos" className="btn-primary inline-block">
            Explorar todos los partidos
          </Link>
        </div>
      </section>
    </div>
  );
}
