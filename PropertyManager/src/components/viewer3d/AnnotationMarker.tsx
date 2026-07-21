import { useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import type { AnnotationMarkerProps } from '../../types/viewer3d.types';

/**
 * AnnotationMarker Component
 *
 * Displays a 3D marker with label for project annotations.
 * Markers can be clicked to view project details.
 */
export function AnnotationMarker({
  annotation,
  isSelected,
  onClick,
  showLabel,
}: AnnotationMarkerProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Gentle pulsing animation for markers
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const scale = isSelected
        ? 1.3 + Math.sin(time * 3) * 0.1
        : hovered
          ? 1.2
          : 1.0 + Math.sin(time * 2) * 0.05;
      meshRef.current.scale.setScalar(scale);
    }
  });

  // Get color based on annotation type
  const getMarkerColor = () => {
    if (isSelected) return '#ffeb3b'; // Yellow when selected
    if (hovered) return '#ff9800'; // Orange when hovered
    return annotation.color;
  };

  // Get icon based on annotation type
  const getAnnotationIcon = () => {
    const icons = {
      project: '🏗️',
      proposed: '💡',
      issue: '⚠️',
      measurement: '📏',
      note: '📌',
    };
    return icons[annotation.type] || '📍';
  };

  return (
    <group position={annotation.position}>
      {/* 3D Marker Sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(annotation.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        castShadow
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={getMarkerColor()}
          emissive={getMarkerColor()}
          emissiveIntensity={isSelected ? 0.5 : hovered ? 0.3 : 0.1}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Pin stem extending down */}
      <mesh position={[0, -0.3, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial
          color={getMarkerColor()}
          emissive={getMarkerColor()}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* HTML Label */}
      {(showLabel || hovered || isSelected) && (
        <Html
          position={[0, 0.5, 0]}
          center
          distanceFactor={10}
          style={{
            transition: 'all 0.2s',
            opacity: isSelected ? 1 : hovered ? 0.9 : 0.8,
            pointerEvents: 'none',
          }}
        >
          <div
            className={`
              px-3 py-2 rounded-lg shadow-lg
              ${isSelected ? 'bg-yellow-500' : 'bg-gray-800'}
              text-white text-sm font-medium
              whitespace-nowrap
              border-2
              ${isSelected ? 'border-yellow-300' : 'border-gray-600'}
            `}
            style={{
              transform: isSelected ? 'scale(1.1)' : 'scale(1)',
              minWidth: '120px',
              textAlign: 'center',
            }}
          >
            <div className="flex items-center gap-2 justify-center">
              <span className="text-base">{getAnnotationIcon()}</span>
              <span>{annotation.label}</span>
            </div>
            {isSelected && annotation.description && (
              <div className="mt-1 text-xs opacity-90 border-t border-yellow-300/30 pt-1">
                {annotation.description}
              </div>
            )}
          </div>
        </Html>
      )}

      {/* Vertical line connecting marker to ground */}
      <mesh position={[0, -annotation.position[1] / 2 - 0.5, 0]}>
        <cylinderGeometry
          args={[0.01, 0.01, annotation.position[1] + 0.5]}
        />
        <meshBasicMaterial
          color={annotation.color}
          opacity={0.3}
          transparent
        />
      </mesh>
    </group>
  );
}
