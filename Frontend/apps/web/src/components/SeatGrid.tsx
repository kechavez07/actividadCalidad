import type { Zone, Seat } from '@shared/types';
import { generateSeats } from '@shared/data/seats';

interface SeatGridProps {
  zone: Zone;
  selectedSeatId: string | null;
  onSeatSelect: (seat: Seat) => void;
}

export default function SeatGrid({ zone, selectedSeatId, onSeatSelect }: SeatGridProps) {
  const seats = generateSeats(zone);

  return (
    <div className="mt-4">
      <p className="text-sm text-gray-400 mb-3">
        Selecciona tu asiento — <span className="text-green-400">verde</span>: disponible /
        <span className="text-gray-500"> gris</span>: ocupado /
        <span className="text-fifa-gold"> dorado</span>: tu selección
      </p>
      <div
        role="grid"
        aria-label={`Asientos de ${zone.name}`}
        className="overflow-auto max-h-72 pr-1"
      >
        {Array.from({ length: zone.rows }, (_, rowIdx) => (
          <div key={rowIdx} className="flex items-center gap-1 mb-1">
            <span className="text-xs text-gray-600 w-5 shrink-0">{rowIdx + 1}</span>
            {seats
              .filter(s => s.row === rowIdx + 1)
              .map(seat => {
                const isSelected = seat.id === selectedSeatId;
                const isOccupied = seat.status === 'purchased' || seat.status === 'reservedOther';
                return (
                  <button
                    key={seat.id}
                    role="gridcell"
                    aria-label={`Fila ${seat.row} Asiento ${seat.number} ${isOccupied ? 'no disponible' : 'disponible'}`}
                    aria-pressed={isSelected}
                    disabled={isOccupied}
                    onClick={() => !isOccupied && onSeatSelect(seat)}
                    className={`w-5 h-5 rounded-sm text-[9px] font-bold transition-all duration-150 ${
                      isSelected
                        ? 'bg-fifa-gold text-fifa-darker scale-110'
                        : isOccupied
                        ? 'bg-gray-700 text-gray-600 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-500 text-white'
                    }`}
                  >
                    {seat.number}
                  </button>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
