import axios, { AxiosInstance } from 'axios';
import SOAP_CONFIG from './soap/config';

const BANCO_URL = SOAP_CONFIG.banco;
const FEDERACION_URL = SOAP_CONFIG.federacion;

const bancoClient: AxiosInstance = axios.create({
  baseURL: BANCO_URL,
  timeout: SOAP_CONFIG.timeout,
  headers: { 'Content-Type': 'text/xml' },
});

const federacionClient: AxiosInstance = axios.create({
  baseURL: FEDERACION_URL,
  timeout: SOAP_CONFIG.timeout,
  headers: { 'Content-Type': 'text/xml' },
});

function parseXML(xmlString: string): Document {
  if (typeof DOMParser !== 'undefined') {
    return new DOMParser().parseFromString(xmlString, 'text/xml');
  }
  throw new Error('DOMParser no disponible');
}

function findElement(doc: Document, tagName: string): string {
  const el = doc.getElementsByTagNameNS('*', tagName)[0];
  return el?.textContent?.trim() || '';
}

function findElementsByTagName(doc: Document, tagName: string): Element[] {
  return Array.from(doc.querySelectorAll('*')).filter(el => el.localName === tagName);
}

function findElementsByTags(doc: Document, tagNames: string[]): Element[] {
  for (const tag of tagNames) {
    const elements = findElementsByTagName(doc, tag);
    if (elements.length > 0) return elements;
  }
  return [];
}

function findChildElement(parent: Element, tagName: string): string {
  const el = parent.getElementsByTagNameNS('*', tagName)[0];
  return el?.textContent?.trim() || '';
}

function findChildElementAny(parent: Element, tagNames: string[]): string {
  for (const tag of tagNames) {
    const value = findChildElement(parent, tag);
    if (value) return value;
  }
  return '';
}

function parseBoolean(value: string | undefined | null): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'si' || v === 'yes';
}

function parseBooleanAny(doc: Document, tagNames: string[]): boolean {
  for (const tag of tagNames) {
    const value = findElement(doc, tag);
    if (value) return parseBoolean(value);
  }
  return false;
}

function findElementAny(doc: Document, tagNames: string[]): string {
  for (const tag of tagNames) {
    const value = findElement(doc, tag);
    if (value) return value;
  }
  return '';
}

function parseNumber(value: string | undefined | null): number {
  if (!value) return 0;
  const n = parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export type OperacionAsientoResult = {
  exitoso: boolean;
  mensaje: string;
};

async function soapRequest(
  client: AxiosInstance,
  xmlBody: string,
  methodName: string,
  maxRetries: number = 3,
  soapAction?: string,
): Promise<Document> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const config: Record<string, unknown> = {};
      if (soapAction) {
        config.headers = { SOAPAction: soapAction };
      }
      const response = await client.post('/', xmlBody, config);
      return parseXML(response.data);
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }
  throw lastError || new Error('Error desconocido en SOAP request');
}

function parseOperacionResult(doc: Document): OperacionAsientoResult {
  return {
    exitoso: parseBooleanAny(doc, ['success', 'exitoso', 'aprobado']),
    mensaje: findElement(doc, 'mensaje') || '',
  };
}

function parseHoraFromFecha(fecha: string): string {
  const isoMatch = fecha.match(/T(\d{2}:\d{2})/);
  if (isoMatch?.[1]) return isoMatch[1];
  const spaceMatch = fecha.match(/\s(\d{2}:\d{2})/);
  if (spaceMatch?.[1]) return spaceMatch[1];
  return '20:00';
}

function parseLugarFields(el: Element): { estadio: string; ciudad: string } {
  const lugar = findChildElementAny(el, ['lugar', 'estadio']);
  const estadioTag = findChildElement(el, 'estadio');
  const ciudadTag = findChildElement(el, 'ciudad');

  if (estadioTag && ciudadTag) {
    return { estadio: estadioTag, ciudad: ciudadTag };
  }

  if (lugar.includes(',')) {
    const parts = lugar.split(',').map(part => part.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return {
        estadio: parts.slice(0, -1).join(', '),
        ciudad: parts[parts.length - 1],
      };
    }
  }

  return {
    estadio: estadioTag || lugar,
    ciudad: ciudadTag || lugar,
  };
}

// ==================== BANCO ENDPOINTS ====================

export async function loginSOAP(usuario: string, contrasena: string): Promise<{ usuario: string; cedula: string }> {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/banco/ws">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:loginRequest>
      <ws:usuario>${usuario}</ws:usuario>
      <ws:contrasena>${contrasena}</ws:contrasena>
    </ws:loginRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  const doc = await soapRequest(bancoClient, xml, 'loginRequest');
  return {
    usuario: findElement(doc, 'usuario'),
    cedula: findElement(doc, 'cedula'),
  };
}

export async function verificarSujetoCredito(cedula: string): Promise<{ apto: boolean; motivo: string }> {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/banco/ws">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:verificarSujetoCreditoRequest>
      <ws:cedula>${cedula}</ws:cedula>
    </ws:verificarSujetoCreditoRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  const doc = await soapRequest(bancoClient, xml, 'verificarSujetoCreditoRequest');
  const esSujeto = findElementAny(doc, ['esSujeto', 'aprobado']);
  const mensaje = findElement(doc, 'mensaje');
  return {
    apto: parseBoolean(esSujeto),
    motivo: mensaje || '',
  };
}

export async function obtenerMontoMaximo(cedula: string): Promise<number> {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/banco/ws">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:obtenerMontoMaximoRequest>
      <ws:cedula>${cedula}</ws:cedula>
    </ws:obtenerMontoMaximoRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  const doc = await soapRequest(bancoClient, xml, 'obtenerMontoMaximoRequest');
  const monto = findElementAny(doc, ['montoMaximo', 'monto', 'valor']);
  return parseNumber(monto);
}

export type RegistroCreditoResult = {
  exitoso: boolean;
  mensaje: string;
  facturaId?: string;
  cuotas: Array<{ numero: number; valorCuota: number; interes: number; capital: number; saldo: number }>;
};

export async function registrarCreditoAmortizacion(
  cedula: string,
  monto: number,
  plazoMeses: number,
): Promise<RegistroCreditoResult> {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/banco/ws">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:registrarCreditoAmortizacionRequest>
      <ws:cedula>${cedula}</ws:cedula>
      <ws:monto>${monto.toFixed(2)}</ws:monto>
      <ws:plazoMeses>${plazoMeses}</ws:plazoMeses>
    </ws:registrarCreditoAmortizacionRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  const doc = await soapRequest(bancoClient, xml, 'registrarCreditoAmortizacionRequest');

  let cuotaElements = findElementsByTags(doc, ['tablaAmortizacion', 'cuota']);
  const cuotas = cuotaElements.map(el => ({
    numero: parseInt(findChildElementAny(el, ['numeroCuota', 'numero']) || '0') || 0,
    valorCuota: parseNumber(findChildElementAny(el, ['valorCuota', 'cuotaMensual'])),
    interes: parseNumber(findChildElementAny(el, ['interesPagado', 'interes'])),
    capital: parseNumber(findChildElementAny(el, ['capitalPagado', 'capitalAmortizado', 'capital'])),
    saldo: parseNumber(findChildElementAny(el, ['saldo', 'saldoPendiente'])),
  }));

  const facturaId =
    findElementAny(doc, ['facturaId', 'idFactura', 'numeroFactura']) || undefined;

  return {
    exitoso: parseBooleanAny(doc, ['aprobado', 'exitoso', 'success']),
    mensaje: findElement(doc, 'mensaje') || '',
    facturaId,
    cuotas,
  };
}

// ==================== FEDERACION ENDPOINTS ====================

export type PartidoSOAP = {
  codigo: string;
  equipoLocal: string;
  equipoVisita: string;
  fecha: string;
  hora: string;
  estadio: string;
  ciudad: string;
};

export async function getPartidosDisponibles(): Promise<PartidoSOAP[]> {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:getPartidosDisponiblesRequest/>
  </soapenv:Body>
</soapenv:Envelope>`;

  const doc = await soapRequest(federacionClient, xml, 'getPartidosDisponiblesRequest');
  const partidoElements = findElementsByTags(doc, ['partidos', 'partido']);
  const partidos = partidoElements.map(el => {
    const fecha = findChildElement(el, 'fecha');
    const hora = findChildElement(el, 'hora') || parseHoraFromFecha(fecha);
    const { estadio, ciudad } = parseLugarFields(el);
    return {
      codigo: findChildElement(el, 'codigo'),
      equipoLocal: findChildElement(el, 'equipoLocal'),
      equipoVisita: findChildElementAny(el, ['equipoVisita', 'equipoVisitante']),
      fecha,
      hora,
      estadio,
      ciudad,
    };
  });
  if (partidos.length === 0) throw new Error('No se encontraron partidos disponibles');
  return partidos;
}

export type LocalidadSOAP = {
  codigo: string;
  nombre: string;
  disponibilidad: number;
  precio: number;
};

export async function getLocalidadesPorPartido(codigoPartido: string): Promise<LocalidadSOAP[]> {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:getLocalidadesPorPartidoRequest>
      <ws:codigoPartido>${codigoPartido}</ws:codigoPartido>
    </ws:getLocalidadesPorPartidoRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  const doc = await soapRequest(federacionClient, xml, 'getLocalidadesPorPartidoRequest', 3, '"getLocalidadesPorPartidoRequest"');
  const localidadElements = findElementsByTags(doc, ['localidades', 'localidad']);
  if (localidadElements.length === 0) throw new Error('No hay localidades para este partido');
  return localidadElements.map(el => {
    const codigo = findChildElementAny(el, ['codigoLocalidad', 'codigo']);
    return {
      codigo,
      nombre: findChildElement(el, 'nombre') || codigo,
      disponibilidad: parseInt(findChildElement(el, 'disponibilidad') || '0') || 0,
      precio: parseNumber(findChildElementAny(el, ['precio', 'precioUnitario'])),
    };
  });
}

export async function decrementarDisponibilidad(
  codigoPartido: string,
  codigoLocalidad: string,
  cantidad: number,
): Promise<OperacionAsientoResult> {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:decrementarDisponibilidadRequest>
      <ws:codigoPartido>${codigoPartido}</ws:codigoPartido>
      <ws:codigoLocalidad>${codigoLocalidad}</ws:codigoLocalidad>
      <ws:cantidad>${cantidad}</ws:cantidad>
    </ws:decrementarDisponibilidadRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  const doc = await soapRequest(federacionClient, xml, 'decrementarDisponibilidadRequest');
  return parseOperacionResult(doc);
}

export async function reservarAsiento(
  codigoPartido: string,
  codigoLocalidad: string,
  numeroAsiento: number,
  clienteCedula: string,
  clienteNombre: string,
): Promise<OperacionAsientoResult> {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:reservarAsientoRequest>
      <ws:codigoPartido>${codigoPartido}</ws:codigoPartido>
      <ws:codigoLocalidad>${codigoLocalidad}</ws:codigoLocalidad>
      <ws:numeroAsiento>${numeroAsiento}</ws:numeroAsiento>
      <ws:clienteCedula>${clienteCedula}</ws:clienteCedula>
      <ws:clienteNombre>${clienteNombre}</ws:clienteNombre>
    </ws:reservarAsientoRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  const doc = await soapRequest(federacionClient, xml, 'reservarAsientoRequest', 1);
  return parseOperacionResult(doc);
}

export async function confirmarCompraAsiento(
  codigoPartido: string,
  codigoLocalidad: string,
  numeroAsiento: number,
  clienteCedula: string,
  facturaId: string,
): Promise<OperacionAsientoResult> {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:confirmarCompraAsientoRequest>
      <ws:codigoPartido>${codigoPartido}</ws:codigoPartido>
      <ws:codigoLocalidad>${codigoLocalidad}</ws:codigoLocalidad>
      <ws:numeroAsiento>${numeroAsiento}</ws:numeroAsiento>
      <ws:clienteCedula>${clienteCedula}</ws:clienteCedula>
      <ws:facturaId>${facturaId}</ws:facturaId>
    </ws:confirmarCompraAsientoRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  const doc = await soapRequest(federacionClient, xml, 'confirmarCompraAsientoRequest', 1);
  return parseOperacionResult(doc);
}

export async function liberarAsiento(
  codigoPartido: string,
  codigoLocalidad: string,
  numeroAsiento: number,
  clienteCedula: string,
): Promise<OperacionAsientoResult> {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:liberarAsientoRequest>
      <ws:codigoPartido>${codigoPartido}</ws:codigoPartido>
      <ws:codigoLocalidad>${codigoLocalidad}</ws:codigoLocalidad>
      <ws:numeroAsiento>${numeroAsiento}</ws:numeroAsiento>
      <ws:clienteCedula>${clienteCedula}</ws:clienteCedula>
    </ws:liberarAsientoRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  const doc = await soapRequest(federacionClient, xml, 'liberarAsientoRequest', 1);
  return parseOperacionResult(doc);
}

export type AsientoInfo = {
  numeroAsiento: number;
  seatIndex: number;
  estado: 'LIBRE' | 'RESERVADO' | 'COMPRADO';
  clienteCedula?: string;
  clienteNombre?: string;
  facturaId?: string;
};

function parseSeatStatus(raw: string): AsientoInfo['estado'] {
  const upper = (raw || 'LIBRE').toUpperCase();
  if (upper === 'COMPRADO') return 'COMPRADO';
  if (upper === 'RESERVADO') return 'RESERVADO';
  return 'LIBRE';
}

export async function consultarAsientos(
  codigoPartido: string,
  codigoLocalidad: string,
): Promise<AsientoInfo[]> {
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ticketpremium.com/federacion/ws">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:consultarAsientosRequest>
      <ws:codigoPartido>${codigoPartido}</ws:codigoPartido>
      <ws:codigoLocalidad>${codigoLocalidad}</ws:codigoLocalidad>
    </ws:consultarAsientosRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  const doc = await soapRequest(federacionClient, xml, 'consultarAsientosRequest', 1);
  const asientoElements = findElementsByTags(doc, ['asientos', 'asiento']);
  if (asientoElements.length === 0) throw new Error('No hay asientos para esta localidad');
  return asientoElements.map(el => {
    const numeroAsiento = parseInt(findChildElementAny(el, ['numeroAsiento', 'numero']) || '0') || 0;
    return {
      numeroAsiento,
      seatIndex: Math.max(0, numeroAsiento - 1),
      estado: parseSeatStatus(findChildElement(el, 'estado')),
      clienteCedula: findChildElement(el, 'clienteCedula') || undefined,
      clienteNombre: findChildElement(el, 'clienteNombre') || undefined,
      facturaId: findChildElement(el, 'facturaId') || undefined,
    };
  });
}

export const soapClient = {
  login: loginSOAP,
  verificarSujetoCredito,
  obtenerMontoMaximo,
  registrarCreditoAmortizacion,
  getPartidosDisponibles,
  getLocalidadesPorPartido,
  decrementarDisponibilidad,
  reservarAsiento,
  confirmarCompraAsiento,
  liberarAsiento,
  consultarAsientos,
};
