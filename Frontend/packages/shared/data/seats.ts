import type { Zone, Seat } from '../types';

/** Layout-only helper; seat states come from consultarAsientos (SOAP). */
export function generateSeats(zone: Zone): Seat[] {
  const seats: Seat[] = [];
  const totalRows = zone.rows || 10;
  const seatsPerRow = zone.seatsPerRow || 20;

  for (let row = 1; row <= totalRows; row++) {
    for (let num = 1; num <= seatsPerRow; num++) {
      seats.push({
        id: `seat-${zone.id}-${row}-${num}`,
        zoneId: zone.id,
        row,
        number: num,
        status: 'available',
      });
    }
  }
  return seats;
}
