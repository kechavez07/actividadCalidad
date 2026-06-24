import type { Stadium, Zone } from '@shared/types';

const fieldConfig = { orient: 'h' as const, w: 180, h: 280 };
const center: [number, number] = [500, 380];
const outline: [number, number][] = [
  [500, 60], [680, 70], [830, 140], [930, 260],
  [945, 380], [930, 500], [830, 620], [680, 690],
  [500, 700], [320, 690], [170, 620], [70, 500],
  [55, 380], [70, 260], [170, 140], [320, 70],
];
const tiers = [
  { scaleIn: 0.30, scaleOut: 0.55, count: 8, label: (i: number, _c: number) => String.fromCharCode(65 + i) },
  { scaleIn: 0.55, scaleOut: 0.76, count: 10, label: (i: number, _c: number) => String.fromCharCode(65 + i) },
  { scaleIn: 0.76, scaleOut: 0.94, count: 12, label: (i: number, _c: number) => String.fromCharCode(65 + i) },
];
const palcos = { scaleIn: 0.55, scaleOut: 0.64, count: 8, label: (i: number) => `P${i + 1}` };

const stadiumsData: Array<{
  id: string; name: string; commercialName?: string; city: string; country: string;
  capacity?: number; lat?: number; lng?: number; address?: string;
  zones: Array<{ id: string; name: string; price: number; rows: number; seatsPerRow: number; color: string }>;
}> = [
  {
    id: 'cdmx', name: 'Estadio Azteca', commercialName: 'Estadio Banorte', city: 'Ciudad de México', country: 'México',
    capacity: 87523, lat: 19.3029, lng: -99.1504, address: 'Calz. de Tlalpan 3465, Sta. Úrsula Coapa, Coyoacán, 04650 Ciudad de México, CDMX',
    zones: [
      { id: 'GENERAL', name: 'General', price: 120, rows: 8, seatsPerRow: 15, color: '#3b82f6' },
      { id: 'PREFERENCIAL', name: 'Preferencial', price: 280, rows: 6, seatsPerRow: 12, color: '#8b5cf6' },
      { id: 'TRIBUNA', name: 'Tribuna', price: 480, rows: 5, seatsPerRow: 10, color: '#f59e0b' },
      { id: 'PALCO', name: 'Palco', price: 950, rows: 3, seatsPerRow: 8, color: '#c9a227' },
    ],
  },
  {
    id: 'gdl', name: 'Estadio Akron', city: 'Guadalajara', country: 'México',
    capacity: 46232, lat: 20.6816, lng: -103.4627, address: 'Carr. a Colima 5660, Las Cañadas, 45680 Zapopan, Jal.',
    zones: [
      { id: 'GENERAL', name: 'General', price: 100, rows: 8, seatsPerRow: 14, color: '#3b82f6' },
      { id: 'PREFERENCIAL', name: 'Preferencial', price: 240, rows: 6, seatsPerRow: 11, color: '#8b5cf6' },
      { id: 'TRIBUNA', name: 'Tribuna', price: 400, rows: 5, seatsPerRow: 9, color: '#f59e0b' },
      { id: 'PALCO', name: 'Palco', price: 800, rows: 3, seatsPerRow: 6, color: '#c9a227' },
    ],
  },
  {
    id: 'mty', name: 'Estadio BBVA', commercialName: 'Estadio BBVA', city: 'Monterrey', country: 'México',
    capacity: 53500, lat: 25.6693, lng: -100.2407, address: 'Hwy 40, Guadalupe, N.L.',
    zones: [
      { id: 'GENERAL', name: 'General', price: 110, rows: 8, seatsPerRow: 14, color: '#3b82f6' },
      { id: 'PREFERENCIAL', name: 'Preferencial', price: 260, rows: 6, seatsPerRow: 11, color: '#8b5cf6' },
      { id: 'TRIBUNA', name: 'Tribuna', price: 450, rows: 5, seatsPerRow: 10, color: '#f59e0b' },
      { id: 'PALCO', name: 'Palco', price: 900, rows: 3, seatsPerRow: 6, color: '#c9a227' },
    ],
  },
  {
    id: 'tor', name: 'BMO Field', city: 'Toronto', country: 'Canadá',
    capacity: 30991, lat: 43.6332, lng: -79.4187, address: '170 Princes Blvd, Toronto, ON M6K 3C3, Canada',
    zones: [
      { id: 'GENERAL', name: 'General', price: 130, rows: 7, seatsPerRow: 13, color: '#3b82f6' },
      { id: 'PREFERENCIAL', name: 'Preferred', price: 290, rows: 5, seatsPerRow: 10, color: '#8b5cf6' },
      { id: 'TRIBUNA', name: 'Club', price: 500, rows: 4, seatsPerRow: 8, color: '#f59e0b' },
      { id: 'PALCO', name: 'VIP', price: 1000, rows: 2, seatsPerRow: 6, color: '#c9a227' },
    ],
  },
  {
    id: 'van', name: 'BC Place', city: 'Vancouver', country: 'Canadá',
    capacity: 54500, lat: 49.2766, lng: -123.1115, address: '777 Pacific Blvd, Vancouver, BC V6B 4Y8, Canada',
    zones: [
      { id: 'GENERAL', name: 'General', price: 120, rows: 8, seatsPerRow: 14, color: '#3b82f6' },
      { id: 'PREFERENCIAL', name: 'Preferred', price: 270, rows: 6, seatsPerRow: 11, color: '#8b5cf6' },
      { id: 'TRIBUNA', name: 'Club', price: 460, rows: 5, seatsPerRow: 9, color: '#f59e0b' },
      { id: 'PALCO', name: 'VIP', price: 880, rows: 3, seatsPerRow: 6, color: '#c9a227' },
    ],
  },
  {
    id: 'lax', name: 'SoFi Stadium', city: 'Los Ángeles', country: 'Estados Unidos',
    capacity: 70000, lat: 33.9533, lng: -118.3390, address: '1001 S Stadium Dr, Inglewood, CA 90301, USA',
    zones: [
      { id: 'GENERAL', name: 'General', price: 150, rows: 10, seatsPerRow: 16, color: '#3b82f6' },
      { id: 'PREFERENCIAL', name: 'Preferred', price: 350, rows: 7, seatsPerRow: 12, color: '#8b5cf6' },
      { id: 'TRIBUNA', name: 'Club', price: 600, rows: 5, seatsPerRow: 10, color: '#f59e0b' },
      { id: 'PALCO', name: 'VIP', price: 1200, rows: 3, seatsPerRow: 8, color: '#c9a227' },
    ],
  },
  {
    id: 'sfo', name: "Levi's Stadium", city: 'Santa Clara', country: 'Estados Unidos',
    capacity: 68500, lat: 37.4030, lng: -121.9697, address: '4900 Marie P DeBartolo Way, Santa Clara, CA 95054, USA',
    zones: [
      { id: 'GENERAL', name: 'General', price: 140, rows: 9, seatsPerRow: 15, color: '#3b82f6' },
      { id: 'PREFERENCIAL', name: 'Preferred', price: 320, rows: 6, seatsPerRow: 11, color: '#8b5cf6' },
      { id: 'TRIBUNA', name: 'Club', price: 550, rows: 5, seatsPerRow: 9, color: '#f59e0b' },
      { id: 'PALCO', name: 'VIP', price: 1100, rows: 3, seatsPerRow: 7, color: '#c9a227' },
    ],
  },
  {
    id: 'nyc', name: 'MetLife Stadium', city: 'East Rutherford', country: 'Estados Unidos',
    capacity: 82500, lat: 40.8135, lng: -74.0745, address: '1 MetLife Stadium Dr, East Rutherford, NJ 07073, USA',
    zones: [
      { id: 'GENERAL', name: 'General', price: 160, rows: 10, seatsPerRow: 16, color: '#3b82f6' },
      { id: 'PREFERENCIAL', name: 'Preferred', price: 380, rows: 7, seatsPerRow: 13, color: '#8b5cf6' },
      { id: 'TRIBUNA', name: 'Club', price: 650, rows: 5, seatsPerRow: 10, color: '#f59e0b' },
      { id: 'PALCO', name: 'VIP', price: 1300, rows: 3, seatsPerRow: 8, color: '#c9a227' },
    ],
  },
  {
    id: 'bos', name: 'Gillette Stadium', city: 'Foxborough', country: 'Estados Unidos',
    capacity: 65878, lat: 42.0909, lng: -71.2643, address: '1 Patriot Pl, Foxborough, MA 02035, USA',
    zones: [
      { id: 'GENERAL', name: 'General', price: 130, rows: 8, seatsPerRow: 14, color: '#3b82f6' },
      { id: 'PREFERENCIAL', name: 'Preferred', price: 300, rows: 6, seatsPerRow: 11, color: '#8b5cf6' },
      { id: 'TRIBUNA', name: 'Club', price: 520, rows: 5, seatsPerRow: 9, color: '#f59e0b' },
      { id: 'PALCO', name: 'VIP', price: 1000, rows: 3, seatsPerRow: 7, color: '#c9a227' },
    ],
  },
  {
    id: 'hou', name: 'NRG Stadium', city: 'Houston', country: 'Estados Unidos',
    capacity: 72220, lat: 29.6847, lng: -95.4108, address: '1 NRG Park, Houston, TX 77054, USA',
    zones: [
      { id: 'GENERAL', name: 'General', price: 140, rows: 9, seatsPerRow: 15, color: '#3b82f6' },
      { id: 'PREFERENCIAL', name: 'Preferred', price: 310, rows: 6, seatsPerRow: 12, color: '#8b5cf6' },
      { id: 'TRIBUNA', name: 'Club', price: 530, rows: 5, seatsPerRow: 10, color: '#f59e0b' },
      { id: 'PALCO', name: 'VIP', price: 1050, rows: 3, seatsPerRow: 7, color: '#c9a227' },
    ],
  },
  {
    id: 'dal', name: "AT&T Stadium", city: 'Arlington', country: 'Estados Unidos',
    capacity: 80000, lat: 32.7475, lng: -97.0932, address: '1 AT&T Way, Arlington, TX 76011, USA',
    zones: [
      { id: 'GENERAL', name: 'General', price: 150, rows: 9, seatsPerRow: 16, color: '#3b82f6' },
      { id: 'PREFERENCIAL', name: 'Preferred', price: 340, rows: 7, seatsPerRow: 12, color: '#8b5cf6' },
      { id: 'TRIBUNA', name: 'Club', price: 580, rows: 5, seatsPerRow: 10, color: '#f59e0b' },
      { id: 'PALCO', name: 'VIP', price: 1150, rows: 3, seatsPerRow: 8, color: '#c9a227' },
    ],
  },
  {
    id: 'phi', name: 'Lincoln Financial Field', city: 'Philadelphia', country: 'Estados Unidos',
    capacity: 67594, lat: 39.9008, lng: -75.1675, address: '1 Lincoln Financial Field Way, Philadelphia, PA 19148, USA',
    zones: [
      { id: 'GENERAL', name: 'General', price: 130, rows: 8, seatsPerRow: 14, color: '#3b82f6' },
      { id: 'PREFERENCIAL', name: 'Preferred', price: 290, rows: 6, seatsPerRow: 11, color: '#8b5cf6' },
      { id: 'TRIBUNA', name: 'Club', price: 500, rows: 5, seatsPerRow: 9, color: '#f59e0b' },
      { id: 'PALCO', name: 'VIP', price: 980, rows: 3, seatsPerRow: 7, color: '#c9a227' },
    ],
  },
  {
    id: 'atl', name: 'Mercedes-Benz Stadium', city: 'Atlanta', country: 'Estados Unidos',
    capacity: 71000, lat: 33.7550, lng: -84.4009, address: '1 AMB Dr NW, Atlanta, GA 30313, USA',
    zones: [
      { id: 'GENERAL', name: 'General', price: 140, rows: 9, seatsPerRow: 15, color: '#3b82f6' },
      { id: 'PREFERENCIAL', name: 'Preferred', price: 330, rows: 6, seatsPerRow: 12, color: '#8b5cf6' },
      { id: 'TRIBUNA', name: 'Club', price: 560, rows: 5, seatsPerRow: 10, color: '#f59e0b' },
      { id: 'PALCO', name: 'VIP', price: 1100, rows: 3, seatsPerRow: 7, color: '#c9a227' },
    ],
  },
  {
    id: 'sea', name: 'Lumen Field', city: 'Seattle', country: 'Estados Unidos',
    capacity: 69000, lat: 47.5952, lng: -122.3316, address: '800 Occidental Ave S, Seattle, WA 98134, USA',
    zones: [
      { id: 'GENERAL', name: 'General', price: 130, rows: 8, seatsPerRow: 14, color: '#3b82f6' },
      { id: 'PREFERENCIAL', name: 'Preferred', price: 300, rows: 6, seatsPerRow: 11, color: '#8b5cf6' },
      { id: 'TRIBUNA', name: 'Club', price: 510, rows: 5, seatsPerRow: 9, color: '#f59e0b' },
      { id: 'PALCO', name: 'VIP', price: 1000, rows: 3, seatsPerRow: 7, color: '#c9a227' },
    ],
  },
  {
    id: 'mia', name: 'Hard Rock Stadium', city: 'Miami Gardens', country: 'Estados Unidos',
    capacity: 65326, lat: 25.9580, lng: -80.2389, address: '347 Don Shula Dr, Miami Gardens, FL 33056, USA',
    zones: [
      { id: 'GENERAL', name: 'General', price: 150, rows: 9, seatsPerRow: 15, color: '#3b82f6' },
      { id: 'PREFERENCIAL', name: 'Preferred', price: 350, rows: 6, seatsPerRow: 11, color: '#8b5cf6' },
      { id: 'TRIBUNA', name: 'Club', price: 600, rows: 5, seatsPerRow: 9, color: '#f59e0b' },
      { id: 'PALCO', name: 'VIP', price: 1200, rows: 3, seatsPerRow: 7, color: '#c9a227' },
    ],
  },
  {
    id: 'kci', name: 'Arrowhead Stadium', city: 'Kansas City', country: 'Estados Unidos',
    capacity: 76416, lat: 39.0489, lng: -94.4839, address: '1 Arrowhead Dr, Kansas City, MO 64129, USA',
    zones: [
      { id: 'GENERAL', name: 'General', price: 120, rows: 8, seatsPerRow: 14, color: '#3b82f6' },
      { id: 'PREFERENCIAL', name: 'Preferred', price: 280, rows: 6, seatsPerRow: 11, color: '#8b5cf6' },
      { id: 'TRIBUNA', name: 'Club', price: 480, rows: 5, seatsPerRow: 9, color: '#f59e0b' },
      { id: 'PALCO', name: 'VIP', price: 950, rows: 3, seatsPerRow: 7, color: '#c9a227' },
    ],
  },
];

export const stadiums: Stadium[] = stadiumsData.map(s => ({
  ...s,
  geometry: { outline, center, field: fieldConfig, tiers, palcos },
}));

export function getStadiumById(id: string): Stadium | undefined {
  return stadiums.find(s => s.id === id);
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9/ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const CITY_ALIASES: Record<string, string> = {
  boston: 'bos',
  houston: 'hou',
  guadalajara: 'gdl',
  monterrey: 'mty',
  toronto: 'tor',
  vancouver: 'van',
  'los angeles': 'lax',
  'santa clara': 'sfo',
  'east rutherford': 'nyc',
  'new york/new jersey': 'nyc',
  'new york': 'nyc',
  arlington: 'dal',
  philadelphia: 'phi',
  atlanta: 'atl',
  seattle: 'sea',
  'miami gardens': 'mia',
  miami: 'mia',
  'kansas city': 'kci',
  'ciudad de mexico': 'cdmx',
  cdmx: 'cdmx',
};

/** Resuelve el estadio local a partir de estadio/ciudad/lugar del SOAP. */
export function resolveStadiumForPartido(partido: {
  estadio?: string;
  ciudad?: string;
}): Stadium | undefined {
  const candidates = [partido.ciudad, partido.estadio].filter(Boolean) as string[];
  if (candidates.length === 0) return undefined;

  for (const candidate of candidates) {
    const byId = getStadiumById(candidate);
    if (byId) return byId;

    const normalized = normalizeText(candidate);
    const aliasId = CITY_ALIASES[normalized];
    if (aliasId) {
      const byAlias = getStadiumById(aliasId);
      if (byAlias) return byAlias;
    }

    const byCity = stadiums.find(stadium => normalizeText(stadium.city) === normalized);
    if (byCity) return byCity;

    const byPartial = stadiums.find(stadium => {
      const city = normalizeText(stadium.city);
      const name = normalizeText(stadium.name);
      return (
        normalized.includes(city) ||
        city.includes(normalized) ||
        normalized.includes(name) ||
        name.includes(normalized)
      );
    });
    if (byPartial) return byPartial;
  }

  const combined = normalizeText(candidates.join(' '));
  for (const [alias, stadiumId] of Object.entries(CITY_ALIASES)) {
    if (combined.includes(alias)) {
      const match = getStadiumById(stadiumId);
      if (match) return match;
    }
  }

  return stadiums.find(stadium => {
    const city = normalizeText(stadium.city);
    const name = normalizeText(stadium.name);
    return combined.includes(city) || combined.includes(name);
  });
}

export function getZoneForSector(stadium: Stadium, sectorId: string): Zone | undefined {
  const tierId = parseInt(sectorId.split('-')[0], 10);
  if (isNaN(tierId) || tierId < 0 || tierId >= stadium.zones.length) return undefined;
  return stadium.zones[tierId];
}
