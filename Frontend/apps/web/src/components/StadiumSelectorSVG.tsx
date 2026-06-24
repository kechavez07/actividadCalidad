'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { Stadium, Seat, Zone } from '@shared/types';
import { getZoneForSector } from '@shared/data/stadiums';
import { soapClient, type AsientoInfo } from '@shared/soap-client';
import {
  buildSeatVisualMap,
  COLUMNS_PER_ROW,
  getReservedMineSeats,
  SEAT_COLORS,
  toNumeroAsiento,
  toRowCol,
  type SeatVisualState,
} from '@shared/seat-utils';

const SVG_NS = 'http://www.w3.org/2000/svg';

interface StadiumSelectorSVGProps {
  stadium: Stadium;
  codigoPartido: string;
  cedulaCliente: string | null;
  clienteNombre: string | null;
  selectedSectorId: string | null;
  selectedZone?: Zone | null;
  onSectorSelect: (sectorId: string, zoneId: string, zoneName: string, price: number) => void;
  onSeatsSelect: (seats: Seat[], sectorId: string) => void;
  onNotify?: (message: string, type?: 'error' | 'success' | 'info') => void;
}

interface Point {
  x: number;
  y: number;
}

// Helper: Create SVG element
function createSVGElement(tag: string, attrs: Record<string, string | number>): SVGElement {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, String(v));
  }
  return el;
}

// Geometry helpers
function scaledVerts(verts: [number, number][], center: [number, number], scale: number): [number, number][] {
  return verts.map(([x, y]) => [
    center[0] + (x - center[0]) * scale,
    center[1] + (y - center[1]) * scale,
  ]);
}

function edgeLens(verts: [number, number][]): { L: number[]; t: number } {
  const L: number[] = [];
  let t = 0;
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    L.push(d);
    t += d;
  }
  return { L, t };
}

// Get point at perimeter fraction f (0..1)
function ptAt(verts: [number, number][], f: number): [number, number] {
  const { L, t } = edgeLens(verts);
  let target = f * t;
  let i = 0;
  while (target > L[i]) {
    target -= L[i];
    i++;
  }
  const a = verts[i];
  const b = verts[(i + 1) % verts.length];
  const k = L[i] ? target / L[i] : 0;
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}

// Color mapping for tiers
const tierColors = {
  0: '#3b82f6', // Lower (azul)
  1: '#8b5cf6', // Club (púrpura)
  2: '#f59e0b', // Upper (naranja)
  3: '#c9a227', // Palcos (dorado)
};

function getTierColor(tierId: number): string {
  return tierColors[tierId as keyof typeof tierColors] || '#999999';
}

export default function StadiumSelectorSVG({
  stadium,
  codigoPartido,
  cedulaCliente,
  clienteNombre,
  selectedSectorId,
  selectedZone,
  onSectorSelect,
  onSeatsSelect,
  onNotify,
}: StadiumSelectorSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ sx: 0, sy: 0 });
  const [asientos, setAsientos] = useState<AsientoInfo[]>([]);
  const [seatVisualMap, setSeatVisualMap] = useState<Map<number, SeatVisualState>>(new Map());
  const [selectedSeats, setSelectedSeats] = useState<Set<number>>(new Set());
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [seatActionLoading, setSeatActionLoading] = useState(false);
  const reservedRef = useRef<Set<number>>(new Set());
  const geometry = stadium.geometry;

  const loadAsientos = useCallback(async () => {
    if (!selectedZone || !codigoPartido) return;
    setLoadingSeats(true);
    try {
      const data = await soapClient.consultarAsientos(codigoPartido, selectedZone.id);
      const visual = buildSeatVisualMap(data, cedulaCliente);
      const mine = getReservedMineSeats(data, cedulaCliente);
      setAsientos(data);
      setSeatVisualMap(visual);
      setSelectedSeats(new Set(mine));
      reservedRef.current = new Set(mine);
    } catch (err) {
      onNotify?.(err instanceof Error ? err.message : 'Error al cargar asientos', 'error');
    } finally {
      setLoadingSeats(false);
    }
  }, [selectedZone, codigoPartido, cedulaCliente, onNotify]);

  const releaseAllReservations = useCallback(async () => {
    if (!selectedZone || !cedulaCliente || reservedRef.current.size === 0) return;
    for (const seatIndex of reservedRef.current) {
      try {
        await soapClient.liberarAsiento(
          codigoPartido,
          selectedZone.id,
          toNumeroAsiento(seatIndex),
          cedulaCliente,
        );
      } catch {
        // best effort
      }
    }
    reservedRef.current = new Set();
    setSelectedSeats(new Set());
  }, [codigoPartido, selectedZone, cedulaCliente]);

  useEffect(() => {
    if (!selectedZone) {
      setAsientos([]);
      setSeatVisualMap(new Map());
      setSelectedSeats(new Set());
      return;
    }
    loadAsientos();
    const interval = setInterval(loadAsientos, 15000);
    return () => {
      clearInterval(interval);
    };
  }, [selectedZone?.id, codigoPartido, cedulaCliente, loadAsientos]);

  const totalRows = useMemo(
    () => (asientos.length > 0 ? Math.ceil(asientos.length / COLUMNS_PER_ROW) : 0),
    [asientos.length],
  );

  // Memoized segment click handler
  const handleSegmentClick = useCallback((e: Event) => {
    const seg = e.currentTarget as SVGElement;
    const dataSectorId = seg.getAttribute('data-sector-id');
    const dataZoneId = seg.getAttribute('data-zone-id');
    const dataZoneName = seg.getAttribute('data-zone-name');
    const dataPrice = seg.getAttribute('data-price');

    if (dataSectorId && dataZoneId && dataZoneName && dataPrice) {
      onSectorSelect(dataSectorId, dataZoneId, dataZoneName, Number(dataPrice));
      setSelectedSeats(new Set());
      setAsientos([]);
      setSeatVisualMap(new Map());
    }
  }, [onSectorSelect]);

  // Draw stadium tiers
  useEffect(() => {
    if (!svgRef.current || !geometry) return;

    const { outline, center, field, tiers, palcos } = geometry;
    svgRef.current.innerHTML = '';

    // Create groups for tiers
    const ringsGroup = createSVGElement('g', {});
    svgRef.current.appendChild(ringsGroup);

    // Draw regular tiers
    tiers.slice().reverse().forEach((tier, idx) => {
      const tierId = tiers.length - 1 - idx;
      buildTier(ringsGroup, outline, center, tier, tierId);
    });

    // Draw palcos if available
    if (palcos) {
      buildTier(ringsGroup, outline, center, palcos, 3);
    }

    // Draw pitch
    const pitchGroup = createSVGElement('g', {});
    svgRef.current.appendChild(pitchGroup);
    drawPitch(pitchGroup, center, field.orient, field.w, field.h);

    // Add click handlers to segments
    svgRef.current.querySelectorAll('.seg').forEach((seg) => {
      seg.addEventListener('click', handleSegmentClick);
    });

    // Cleanup listeners on unmount or when handler changes
    return () => {
      svgRef.current?.querySelectorAll('.seg').forEach((seg) => {
        seg.removeEventListener('click', handleSegmentClick);
      });
    };
  }, [stadium, handleSegmentClick, geometry, selectedSectorId]);

  // Apply transform
  useEffect(() => {
    if (svgRef.current) {
      svgRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
      svgRef.current.style.transformOrigin = 'center center';
    }
  }, [scale, tx, ty]);

  // Zoom handlers
  const handleZoomIn = () => {
    setScale((s) => Math.min(s * 1.25, 3.5));
  };

  const handleZoomOut = () => {
    setScale((s) => Math.max(s / 1.25, 1));
    if (scale === 1) {
      setTx(0);
      setTy(0);
    }
  };

  // Pan handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragRef.current = {
      sx: e.clientX - tx,
      sy: e.clientY - ty,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      setTx(e.clientX - dragRef.current.sx);
      setTy(e.clientY - dragRef.current.sy);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging]);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newScale = Math.max(1, Math.min(3.5, scale * (e.deltaY < 0 ? 1.1 : 0.9)));
    setScale(newScale);
    if (newScale === 1) {
      setTx(0);
      setTy(0);
    }
  };

  const handleClear = () => {
    setScale(1);
    setTx(0);
    setTy(0);
  };

  const handleToggleSeat = async (seatIndex: number) => {
    if (!selectedZone || !cedulaCliente || !clienteNombre || seatActionLoading) return;

    const visual = seatVisualMap.get(seatIndex) ?? 'available';
    if (visual === 'reservedOther' || visual === 'purchased') {
      onNotify?.('Asiento no disponible', 'error');
      return;
    }

    setSeatActionLoading(true);
    try {
      const numeroAsiento = toNumeroAsiento(seatIndex);
      const isMine = selectedSeats.has(seatIndex);

      if (isMine) {
        const result = await soapClient.liberarAsiento(
          codigoPartido,
          selectedZone.id,
          numeroAsiento,
          cedulaCliente,
        );
        if (!result.exitoso) {
          onNotify?.(result.mensaje || 'No se pudo liberar el asiento', 'error');
          await loadAsientos();
          return;
        }
      } else {
        const result = await soapClient.reservarAsiento(
          codigoPartido,
          selectedZone.id,
          numeroAsiento,
          cedulaCliente,
          clienteNombre,
        );
        if (!result.exitoso) {
          onNotify?.(result.mensaje || 'Asiento no disponible', 'error');
          await loadAsientos();
          return;
        }
      }
      await loadAsientos();
    } catch (err) {
      onNotify?.(err instanceof Error ? err.message : 'Error al reservar asiento', 'error');
      await loadAsientos();
    } finally {
      setSeatActionLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (selectedSeats.size === 0 || !selectedSectorId || !currentZone) return;

    const seatsArray: Seat[] = Array.from(selectedSeats).map((seatIndex) => {
      const { row, col } = toRowCol(seatIndex);
      return {
        id: `seat-${currentZone.id}-${seatIndex}`,
        zoneId: currentZone.id,
        row,
        number: toNumeroAsiento(seatIndex),
        status: 'selected',
      };
    });

    onSeatsSelect(seatsArray, selectedSectorId);
    setSelectedSeats(new Set());
  };

  function buildTier(
    g: SVGElement,
    verts: [number, number][],
    ctr: [number, number],
    tier: any,
    tierId: number
  ) {
    const { scaleIn, scaleOut, count, label } = tier;
    const vi = scaledVerts(verts, ctr, scaleIn);
    const vo = scaledVerts(verts, ctr, scaleOut);

    for (let i = 0; i < count; i++) {
      const fA = (i / count + (tier.start || 0)) % 1;
      const fB = ((i + 1) / count + (tier.start || 0)) % 1;
      const sub = 6;
      const outer: [number, number][] = [];
      const inner: [number, number][] = [];

      for (let s = 0; s <= sub; s++) {
        const f = (fA + (((fB - fA + 1) % 1) * s) / sub) % 1;
        outer.push(ptAt(vo, f));
      }

      for (let s = sub; s >= 0; s--) {
        const f = (fA + (((fB - fA + 1) % 1) * s) / sub) % 1;
        inner.push(ptAt(vi, f));
      }

      const pts = [...outer, ...inner];
      const d =
        'M' +
        pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L') +
        'Z';

      // Map sector to zone
      const sectorLabel = label ? label(i) : String(i);
      const sectorId = `${tierId}-${sectorLabel}`;
      const zone = getZoneForSector(stadium, sectorId);
      const zoneInfo = zone
        ? { zoneId: zone.id, zoneName: zone.name, price: zone.price }
        : { zoneId: '', zoneName: 'Desconocida', price: 0 };
      const fill = getTierColor(tierId);

      const isSelected = selectedSectorId === sectorId;
      const path = createSVGElement('path', {
        d,
        fill,
        class: `seg ${isSelected ? 'sel' : ''}`,
        'data-sector-id': sectorId,
        'data-zone-id': zoneInfo.zoneId,
        'data-zone-name': zoneInfo.zoneName,
        'data-price': zoneInfo.price,
        opacity: isSelected ? '1' : selectedSectorId ? '0.3' : '1',
        style: `cursor: pointer; transition: filter 0.2s; filter: ${
          isSelected ? 'brightness(1.2)' : 'brightness(1)'
        }`,
      }) as SVGPathElement;

      path.addEventListener('mouseenter', () => {
        (path as any).style.filter = 'brightness(1.13)';
      });

      path.addEventListener('mouseleave', () => {
        if (isSelected) {
          (path as any).style.filter = 'brightness(1.2)';
        } else {
          (path as any).style.filter = 'brightness(1)';
        }
      });

      g.appendChild(path);

      // Add label if tier has label function
      if (label) {
        const sec = label(i);
        (path as any).dataset.sec = sec;

        const fm = (fA + ((fB - fA + 1) % 1) / 2) % 1;
        const pm = ptAt(scaledVerts(verts, ctr, (scaleIn + scaleOut) / 2), fm);

        const textColor = ['#d04a9e', '#8b5cf6', '#7c3aed', '#5c9e6c', '#c9a227'].includes(fill)
          ? '#fff'
          : '#1b2733';

        const text = createSVGElement('text', {
          x: pm[0].toFixed(1),
          y: (pm[1] + 3).toFixed(1),
          'text-anchor': 'middle',
          class: 'seg-label pointer-events-none',
          fill: textColor,
          'font-size': '11',
          'font-weight': 'bold',
        });
        text.textContent = sec;
        g.appendChild(text);
      }
    }
  }


  function drawPitch(g: SVGElement, ctr: [number, number], orient: 'h' | 'v', w: number, h: number) {
    const x = ctr[0] - w / 2;
    const y = ctr[1] - h / 2;

    g.appendChild(
      createSVGElement('rect', {
        x: x.toFixed(1),
        y: y.toFixed(1),
        width: w.toFixed(1),
        height: h.toFixed(1),
        rx: 7,
        fill: '#3f9e4f',
      })
    );

    const n = 10;
    for (let s = 0; s < n; s++) {
      if (s % 2 === 0) {
        if (orient === 'h') {
          g.appendChild(
            createSVGElement('rect', {
              x: (x + (s * w) / n).toFixed(1),
              y: y.toFixed(1),
              width: (w / n).toFixed(1),
              height: h.toFixed(1),
              fill: '#46a957',
            })
          );
        } else {
          g.appendChild(
            createSVGElement('rect', {
              x: x.toFixed(1),
              y: (y + (s * h) / n).toFixed(1),
              width: w.toFixed(1),
              height: (h / n).toFixed(1),
              fill: '#46a957',
            })
          );
        }
      }
    }

    g.appendChild(
      createSVGElement('rect', {
        x: x.toFixed(1),
        y: y.toFixed(1),
        width: w.toFixed(1),
        height: h.toFixed(1),
        rx: 7,
        fill: 'none',
        stroke: '#fff',
        'stroke-width': '2',
        opacity: '0.85',
      })
    );

    if (orient === 'h') {
      g.appendChild(
        createSVGElement('line', {
          x1: ctr[0].toFixed(1),
          y1: y.toFixed(1),
          x2: ctr[0].toFixed(1),
          y2: (y + h).toFixed(1),
          stroke: '#fff',
          'stroke-width': '2',
          opacity: '0.85',
        })
      );
    } else {
      g.appendChild(
        createSVGElement('line', {
          x1: x.toFixed(1),
          y1: ctr[1].toFixed(1),
          x2: (x + w).toFixed(1),
          y2: ctr[1].toFixed(1),
          stroke: '#fff',
          'stroke-width': '2',
          opacity: '0.85',
        })
      );
    }

    g.appendChild(
      createSVGElement('circle', {
        cx: ctr[0].toFixed(1),
        cy: ctr[1].toFixed(1),
        r: (Math.min(w, h) * 0.17).toFixed(1),
        stroke: '#fff',
        'stroke-width': '2',
        opacity: '0.85',
        fill: 'none',
      })
    );

    g.appendChild(
      createSVGElement('circle', {
        cx: ctr[0].toFixed(1),
        cy: ctr[1].toFixed(1),
        r: '2.5',
        fill: '#fff',
      })
    );

    if (orient === 'h') {
      [-1, 1].forEach((s) => {
        const bx = s < 0 ? x : x + w - 46;
        g.appendChild(
          createSVGElement('rect', {
            x: bx.toFixed(1),
            y: (ctr[1] - 38).toFixed(1),
            width: '46',
            height: '76',
            stroke: '#fff',
            'stroke-width': '2',
            opacity: '0.85',
            fill: 'none',
          })
        );
      });
    } else {
      [-1, 1].forEach((s) => {
        const by = s < 0 ? y : y + h - 46;
        g.appendChild(
          createSVGElement('rect', {
            x: (ctr[0] - 38).toFixed(1),
            y: by.toFixed(1),
            width: '76',
            height: '46',
            stroke: '#fff',
            'stroke-width': '2',
            opacity: '0.85',
            fill: 'none',
          })
        );
      });
    }
  }

  // Get current selected zone info
  const currentZone = selectedZone || null;

  const subtotal = selectedSeats.size * (currentZone?.price ?? 0);

  function seatButtonClass(visual: SeatVisualState, isSelected: boolean): string {
    if (isSelected || visual === 'reservedMine') {
      return 'text-white scale-110 cursor-pointer';
    }
    if (visual === 'reservedOther') {
      return 'text-white cursor-not-allowed opacity-90';
    }
    if (visual === 'purchased') {
      return 'text-gray-300 cursor-not-allowed';
    }
    return 'text-white hover:opacity-90 cursor-pointer';
  }

  function seatButtonStyle(visual: SeatVisualState, isSelected: boolean): React.CSSProperties {
    const state = isSelected ? 'reservedMine' : visual;
    return { backgroundColor: SEAT_COLORS[state] };
  }

  if (!geometry) {
    return <div className="p-4 text-center text-gray-500">Geometría no disponible</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* SVG Panel */}
        <div className="lg:col-span-2 relative">
          {/* Toolbar */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md">
              <button
                onClick={handleZoomIn}
                className="w-10 h-10 text-xl font-bold text-gray-700 hover:bg-gray-100 hover:text-teal-600 flex items-center justify-center"
                aria-label="Zoom in"
              >
                +
              </button>
              <div className="border-t border-gray-200"></div>
              <button
                onClick={handleZoomOut}
                className="w-10 h-10 text-xl font-bold text-gray-700 hover:bg-gray-100 hover:text-teal-600 flex items-center justify-center"
                aria-label="Zoom out"
              >
                −
              </button>
            </div>
          </div>

          {/* Clear button */}
          {selectedSectorId && (
            <button
              onClick={() => {
                void releaseAllReservations();
                onSectorSelect('', '', '', 0);
                setSelectedSeats(new Set());
                setAsientos([]);
                setSeatVisualMap(new Map());
              }}
              className="absolute top-4 left-[62px] z-10 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 shadow-md hover:bg-gray-50"
              aria-label="Clear selection"
            >
              Clear ✕
            </button>
          )}

          {/* Stadium tag */}
          <div className="absolute top-4 right-4 z-10 bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-full">
            {stadium.name}
          </div>

          {/* SVG Container */}
          <div
            ref={hostRef}
            className="w-full aspect-video bg-gray-200 cursor-grab active:cursor-grabbing overflow-hidden touch-none"
            onPointerDown={handlePointerDown}
            onWheel={handleWheel}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 1000 760"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full block transition-transform duration-75"
            />
          </div>
        </div>

        {/* Sidebar - Seat Grid Panel */}
        <div className="bg-gray-50 border-l border-gray-200 p-4 flex flex-col max-h-[600px] overflow-y-auto">
          {!selectedSectorId ? (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Leyenda</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">Lower (Cabecera)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-gray-600">Club (Preferente)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500 rounded"></div>
                  <span className="text-gray-600">Upper (Plateas)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                  <span className="text-gray-600">Palcos VIP</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Haz clic en una zona del estadio para comenzar
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">{currentZone?.name || 'Sector'}</h3>
                <p className="text-sm text-gray-600 mb-1">Sector: {selectedSectorId}</p>
                <p className="text-lg font-bold text-yellow-600">${currentZone?.price.toLocaleString() || '0'} USD</p>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-500 mb-2">Estados de asientos:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: SEAT_COLORS.available }} />
                    <span className="text-gray-600">Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: SEAT_COLORS.reservedOther }} />
                    <span className="text-gray-600">Reservado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: SEAT_COLORS.purchased }} />
                    <span className="text-gray-600">Comprado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: SEAT_COLORS.reservedMine }} />
                    <span className="text-gray-600">Tu reserva</span>
                  </div>
                </div>
              </div>

              {/* Grid de asientos */}
              <div className="border-t border-gray-200 pt-3">
                <p className="text-sm font-semibold text-gray-900 mb-2">Grid de asientos:</p>
                {loadingSeats && (
                  <p className="text-xs text-gray-500 mb-2">Cargando asientos...</p>
                )}
                <div className="bg-white rounded border border-gray-200 p-2 max-h-64 overflow-y-auto">
                  {!currentZone ? (
                    <p className="text-xs text-red-500 text-center py-2 font-semibold">
                      ⚠️ No se pudo resolver la zona
                    </p>
                  ) : asientos.length > 0 ? (
                    Array.from({ length: totalRows }, (_, rowIdx) => (
                      <div key={`row-${rowIdx}`} className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-gray-600 w-5 shrink-0 font-semibold">
                          {rowIdx + 1}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {Array.from({ length: COLUMNS_PER_ROW }, (_, colIdx) => {
                            const seatIndex = rowIdx * COLUMNS_PER_ROW + colIdx;
                            if (seatIndex >= asientos.length) return null;
                            const visual = seatVisualMap.get(seatIndex) ?? 'available';
                            const isSelected = selectedSeats.has(seatIndex);
                            const disabled =
                              seatActionLoading ||
                              visual === 'reservedOther' ||
                              visual === 'purchased';
                            const { col } = toRowCol(seatIndex);
                            return (
                              <button
                                key={seatIndex}
                                onClick={() => !disabled && handleToggleSeat(seatIndex)}
                                disabled={disabled}
                                style={seatButtonStyle(visual, isSelected)}
                                className={`w-5 h-5 rounded text-[8px] font-bold transition-all duration-150 ${seatButtonClass(visual, isSelected)}`}
                                aria-label={`Fila ${rowIdx + 1} Asiento ${col}`}
                                title={
                                  visual === 'reservedOther'
                                    ? 'Reservado'
                                    : visual === 'purchased'
                                    ? 'Comprado'
                                    : `Fila ${rowIdx + 1}, Asiento ${col}`
                                }
                              >
                                {col}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-2">
                      Sin asientos disponibles
                    </p>
                  )}
                </div>
              </div>

              {/* Counter and button */}
              <div className="border-t border-gray-200 pt-3 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Asientos:</span>
                  <span className="font-bold text-gray-900">{selectedSeats.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="font-bold text-lg text-yellow-600">${subtotal.toLocaleString()}</span>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={selectedSeats.size === 0 || seatActionLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Agregar al carrito
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend Footer */}
      {!selectedSectorId && (
        <div className="flex flex-wrap gap-6 px-5 py-4 border-t border-gray-200 bg-white text-sm font-bold">
          {stadium.zones.map((zone) => (
            <div key={zone.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: zone.color }}
                aria-label={zone.name}
              ></div>
              <span className="text-gray-700">{zone.name.split('(')[0].trim()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
