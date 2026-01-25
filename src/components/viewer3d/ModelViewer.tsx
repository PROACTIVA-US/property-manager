import { Suspense, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { AnnotationMarker } from './AnnotationMarker';
import type { ModelViewerProps } from '../../types/viewer3d.types';

/**
 * LoadingFallback Component
 *
 * Displayed while the 3D model is loading.
 */
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial
        color="#666666"
        wireframe
        opacity={0.5}
        transparent
      />
    </mesh>
  );
}

/**
 * Model Component
 *
 * Loads and displays a GLTF/GLB 3D model.
 */
function Model({
  modelUrl,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  onLoad,
  onError,
}: Omit<ModelViewerProps, 'annotations' | 'onAnnotationClick' | 'showAnnotations'>) {
  // Load GLTF model using useGLTF hook from drei
  const { scene } = useGLTF(modelUrl);

  useEffect(() => {
    if (scene) {
      // Enable shadows for all meshes in the model
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });

      onLoad?.();
    }
  }, [scene, onLoad]);

  // Handle errors
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      if (error.filename?.includes(modelUrl)) {
        onError?.(new Error(`Failed to load model: ${error.message}`));
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [modelUrl, onError]);

  const scaleValue = typeof scale === 'number' ? [scale, scale, scale] : scale;

  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={scaleValue}
    />
  );
}

/**
 * ModelViewer Component
 *
 * Main component for displaying 3D models with annotations.
 * Uses Suspense for loading states.
 */
export function ModelViewer({
  modelUrl,
  position,
  rotation,
  scale,
  onLoad,
  onError,
  annotations = [],
  onAnnotationClick,
  showAnnotations = true,
}: ModelViewerProps) {
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  const handleAnnotationClick = (id: string) => {
    setSelectedAnnotationId(id);
    onAnnotationClick?.(id);
  };

  return (
    <>
      {/* 3D Model */}
      <Suspense fallback={<LoadingFallback />}>
        <Model
          modelUrl={modelUrl}
          position={position}
          rotation={rotation}
          scale={scale}
          onLoad={onLoad}
          onError={onError}
        />
      </Suspense>

      {/* Annotations */}
      {showAnnotations &&
        annotations.map((annotation) => (
          <AnnotationMarker
            key={annotation.id}
            annotation={annotation}
            isSelected={selectedAnnotationId === annotation.id}
            onClick={handleAnnotationClick}
            showLabel={true}
          />
        ))}
    </>
  );
}

// Preload models for better performance
export function preloadModel(url: string) {
  useGLTF.preload(url);
}

// Import React and THREE for the component
import { useState } from 'react';
import * as THREE from 'three';

// Make useGLTF available for preloading
ModelViewer.preload = preloadModel;
