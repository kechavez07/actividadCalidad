import { useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Zone, Seat } from '@shared/types';
import { generateSeats } from '@shared/data/seats';

interface ZoneMeshProps {
  zone: Zone;
  position: [number, number, number];
  rotation: [number, number, number];
  isSelected: boolean;
  isHovered: boolean;
  onHover: (zoneId: string | null) => void;
  onSelect: (zone: Zone) => void;
}

function ZoneMesh({ zone, position, rotation, isSelected, isHovered, onHover, onSelect }: ZoneMeshProps) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!mesh.current) return;
    const target = isSelected ? 1.08 : isHovered ? 1.04 : 1;
    mesh.current.scale.setScalar(THREE.MathUtils.lerp(mesh.current.scale.x, target, 0.1));
  });

  const color = isSelected
    ? '#f0c84a'
    : isHovered
    ? new THREE.Color(zone.color).lerp(new THREE.Color('#ffffff'), 0.3).getStyle()
    : zone.color;

  return (
    <mesh
      ref={mesh}
      position={position}
      rotation={rotation}
      onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(zone); }}
      onPointerEnter={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(zone.id); document.body.style.cursor = 'pointer'; }}
      onPointerLeave={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(null); document.body.style.cursor = 'default'; }}
    >
      <boxGeometry args={[2.2, 0.4, 1.2]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
    </mesh>
  );
}

function Pitch() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[5, 7.5]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.9} />
      </mesh>
      {/* Líneas del campo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <planeGeometry args={[4.6, 7]} />
        <meshStandardMaterial color="#3a7a30" roughness={0.9} />
      </mesh>
    </>
  );
}

interface StadiumSelector3DProps {
  zones: Zone[];
  onZoneSelect: (zone: Zone) => void;
  selectedZoneId?: string;
}

export default function StadiumSelector3D({ zones, onZoneSelect, selectedZoneId }: StadiumSelector3DProps) {
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  const handleHover = useCallback((id: string | null) => {
    setHoveredZoneId(id);
  }, []);

  const zonePositions: Record<string, { position: [number, number, number]; rotation: [number, number, number] }> = {
    north: { position: [0, -0.3,  4.2], rotation: [0.35, 0, 0] },
    south: { position: [0, -0.3, -4.2], rotation: [-0.35, 0, 0] },
    east:  { position: [ 3.6, -0.3, 0], rotation: [0, 0, 0.35] },
    west:  { position: [-3.6, -0.3, 0], rotation: [0, 0, -0.35] },
    vip:   { position: [0, 1.2, 0],     rotation: [-Math.PI / 2, 0, 0] },
  };

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden bg-fifa-darker border border-fifa-blue/30">
      <Canvas camera={{ position: [0, 8, 12], fov: 45 }} shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 8, -5]} intensity={0.4} color="#c9a227" />

        <Pitch />

        {zones.map(zone => {
          const pos = zonePositions[zone.id];
          if (!pos) return null;
          return (
            <ZoneMesh
              key={zone.id}
              zone={zone}
              position={pos.position}
              rotation={pos.rotation}
              isSelected={zone.id === selectedZoneId}
              isHovered={zone.id === hoveredZoneId}
              onHover={handleHover}
              onSelect={onZoneSelect}
            />
          );
        })}

        {zones.map(zone => {
          const pos = zonePositions[zone.id];
          if (!pos) return null;
          return (
            <Text
              key={`label-${zone.id}`}
              position={[pos.position[0], pos.position[1] + 0.5, pos.position[2]]}
              fontSize={0.28}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {zone.name.split(' ')[0]}
            </Text>
          );
        })}

        <OrbitControls
          enablePan={false}
          minDistance={8}
          maxDistance={22}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
    </div>
  );
}

interface SeatGridProps {
  zone: Zone;
  selectedSeatId: string | null;
  onSeatSelect: (seat: Seat) => void;
}

export function SeatGrid({ zone, selectedSeatId, onSeatSelect }: SeatGridProps) {
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
