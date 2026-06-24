import { Link } from 'react-router-dom';
import type { PartidoSOAP } from '@shared/soap-client';

interface Props {
  partido: PartidoSOAP;
  stadium: { name: string; city: string } | null;
}

export default function MatchCard({ partido: p, stadium }: Props) {
  const date = new Date(`${p.fecha}T${p.hora}`);
  const formattedDate = date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <Link to={`/partidos/${p.codigo}`}>
      <div className="card group cursor-pointer hover:scale-[1.01] transition-transform duration-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400">{p.codigo}</span>
        </div>

        <div className="flex items-center justify-between gap-2 my-4">
          <div className="flex-1 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-fifa-blue/40 flex items-center justify-center mb-2 group-hover:bg-fifa-blue/60 transition-colors">
              <span className="text-lg font-bold">{p.equipoLocal.slice(0, 2).toUpperCase()}</span>
            </div>
            <p className="text-sm font-semibold text-white leading-tight">{p.equipoLocal}</p>
          </div>

          <div className="text-center px-2">
            <p className="text-lg font-display font-bold text-fifa-gold">VS</p>
            <p className="text-xs text-gray-500 mt-1">{p.hora}</p>
          </div>

          <div className="flex-1 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-fifa-blue/40 flex items-center justify-center mb-2 group-hover:bg-fifa-blue/60 transition-colors">
              <span className="text-lg font-bold">{p.equipoVisita.slice(0, 2).toUpperCase()}</span>
            </div>
            <p className="text-sm font-semibold text-white leading-tight">{p.equipoVisita}</p>
          </div>
        </div>

        <div className="border-t border-fifa-blue/20 pt-3 flex items-center justify-between text-xs text-gray-400">
          <span>{formattedDate}</span>
          <span>{p.estadio}, {p.ciudad}</span>
        </div>
      </div>
    </Link>
  );
}
