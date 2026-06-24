export type Group = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export type SeatStatus = 'available' | 'reservedOther' | 'reservedMine' | 'purchased' | 'selected';

export type PaymentForm = {
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  email: string;
};

export interface Zone {
  id: string;
  name: string;
  price: number;
  rows: number;
  seatsPerRow: number;
  color: string;
}

export interface Stadium {
  id: string;
  name: string;
  commercialName?: string;
  city: string;
  country: string;
  capacity?: number;
  lat?: number;
  lng?: number;
  address?: string;
  zones: Zone[];
  geometry?: {
    outline: [number, number][];
    center: [number, number];
    field: {
      orient: 'h' | 'v';
      w: number;
      h: number;
    };
    tiers: Array<{
      scaleIn: number;
      scaleOut: number;
      count: number;
      label?: (i: number, count: number) => string;
    }>;
    palcos?: {
      scaleIn: number;
      scaleOut: number;
      count: number;
      label?: (i: number) => string;
    };
  };
}

export interface Match {
  id: string;
  date: string;
  time: string;
  group: Group;
  phase: 'Primera fase';
  home: string;
  away: string;
  stadiumId: string;
}

export interface Seat {
  id: string;
  zoneId: string;
  row: number;
  number: number;
  status: SeatStatus;
}

export interface CartItem {
  id: string;
  matchId: string;
  matchLabel: string;
  stadiumName: string;
  date: string;
  time: string;
  zoneId: string;
  zoneName: string;
  codigoPartido: string;
  row: number;
  seatNumber: number;
  price: number;
  quantity: number;
}

export interface OrderConfirmation {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  serviceFee: number;
  total: number;
  email: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface PolygonSector {
  id: string;
  tierId: number;
  sectionIndex: number;
  zoneId: string;
  label: string;
}

export interface SeatGridData {
  sectorId: string;
  zoneId: string;
  zoneName: string;
  price: number;
  seats: Seat[];
  selectedSeats: string[];
}

// ==================== TIPOS SOAP ====================

export type LoginResponse = {
  usuario: string;
  cedula: string;
};

export type CreditoResponse = {
  apto: boolean;
  motivo?: string;
};

export type MontoMaximoResponse = {
  montoMaximo: number;
};

export type Cuota = {
  numero: number;
  valorCuota: number;
  interes: number;
  capital: number;
  saldo: number;
};

export type TablaAmortizacion = {
  cuotas: Cuota[];
};

export type PartidoSOAP = {
  codigo: string;
  equipoLocal: string;
  equipoVisita: string;
  fecha: string;
  hora: string;
  estadio: string;
  ciudad: string;
};

export type LocalidadSOAP = {
  codigo: string;
  nombre: string;
  disponibilidad: number;
  precio: number;
};
