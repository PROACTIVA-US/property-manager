import { OrbitControls, Environment, Grid } from '@react-three/drei';
import type { SceneControlsProps } from '../../types/viewer3d.types';

/**
 * SceneControls Component
 *
 * Provides camera controls, lighting, and environment for the 3D scene.
 * Uses OrbitControls from drei for camera manipulation.
 */
export function SceneControls({
  enableRotate = true,
  enableZoom = true,
  enablePan = true,
  minDistance = 5,
  maxDistance = 50,
  target,
  autoRotate = false,
  autoRotateSpeed = 1,
}: SceneControlsProps) {
  return (
    <>
      {/* Camera Controls */}
      <OrbitControls
        enableRotate={enableRotate}
        enableZoom={enableZoom}
        enablePan={enablePan}
        minDistance={minDistance}
        maxDistance={maxDistance}
        target={target}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.5}
        panSpeed={0.5}
        enableDamping
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <hemisphereLight
        color="#87ceeb"
        groundColor="#8b7355"
        intensity={0.3}
      />

      {/* Environment - provides realistic reflections and ambient lighting */}
      <Environment preset="sunset" />

      {/* Grid Helper - for orientation */}
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#888888"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#444444"
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />

      {/* Ground Plane - receives shadows */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#a0a0a0" opacity={0.3} transparent />
      </mesh>
    </>
  );
}
