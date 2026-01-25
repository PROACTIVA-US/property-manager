import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneControls } from './SceneControls';
import { ModelViewer } from './ModelViewer';
import { ModelLibrary } from './ModelLibrary';
import { ModelUploader } from './ModelUploader';
import type { Property3DViewerProps, ViewerMode, ModelAsset } from '../../types/viewer3d.types';

/**
 * Property3DViewer Component
 *
 * Main container for the 3D property visualization system.
 * Integrates all 3D viewer components and manages the scene state.
 */
export function Property3DViewer({
  propertyId: _propertyId,
  modelUrl: externalModelUrl,
  annotations,
  mode: externalMode = 'view',
  onAnnotationClick,
  onAnnotationAdd: _onAnnotationAdd,
  onAnnotationUpdate: _onAnnotationUpdate,
  onAnnotationDelete: _onAnnotationDelete,
  onModeChange,
  className = '',
}: Property3DViewerProps) {
  const [localMode, setLocalMode] = useState<ViewerMode>(externalMode);
  const [localModelUrl, setLocalModelUrl] = useState<string | undefined>(externalModelUrl);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const mode = externalMode || localMode;
  const modelUrl = externalModelUrl || localModelUrl;

  const handleModeChange = (newMode: ViewerMode) => {
    if (onModeChange) {
      onModeChange(newMode);
    } else {
      setLocalMode(newMode);
    }
  };

  const handleAssetSelect = (asset: ModelAsset) => {
    setLocalModelUrl(asset.modelUrl);
    setShowLibrary(false);
  };

  const handleModelUpload = async (_file: File) => {
    // File is already processed in ModelUploader
    // Just close the uploader modal
    setShowUploader(false);
  };

  const handleResetCamera = () => {
    // Camera will reset through OrbitControls
    window.location.reload(); // Simple way to reset for MVP
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <div className="flex flex-col gap-2">
          {/* Mode Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleModeChange('view')}
              className={`
                px-3 py-1.5 rounded text-sm font-medium transition-colors
                ${mode === 'view' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
              title="View Mode"
            >
              👁️ View
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('annotate')}
              className={`
                px-3 py-1.5 rounded text-sm font-medium transition-colors
                ${mode === 'annotate' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
              title="Annotate Mode - Click on model to add markers"
            >
              📍 Annotate
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('edit')}
              className={`
                px-3 py-1.5 rounded text-sm font-medium transition-colors
                ${mode === 'edit' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
              title="Edit Mode"
            >
              ✏️ Edit
            </button>
          </div>

          <div className="border-t border-gray-200 pt-2">
            {/* Action Buttons */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setShowLibrary(true)}
                className="w-full px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium transition-colors text-left"
              >
                📚 Model Library
              </button>
              <button
                type="button"
                onClick={() => setShowUploader(true)}
                className="w-full px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium transition-colors text-left"
              >
                📤 Upload Model
              </button>
              <button
                type="button"
                onClick={handleResetCamera}
                className="w-full px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium transition-colors text-left"
              >
                🔄 Reset View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {mode === 'annotate' && (
        <div className="absolute top-4 right-4 z-10 bg-yellow-50 border-2 border-yellow-300 rounded-lg shadow-lg p-3 max-w-xs">
          <p className="text-sm text-yellow-900">
            <strong>Annotate Mode:</strong> Click anywhere on the 3D model to add a project marker.
          </p>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [10, 10, 10], fov: 50 }}
        className="w-full h-full bg-gradient-to-b from-sky-200 to-sky-100"
      >
        {/* Scene Controls (Lighting, Grid, Camera) */}
        <SceneControls />

        {/* 3D Model (if loaded) */}
        {modelUrl ? (
          <ModelViewer
            modelUrl={modelUrl}
            annotations={annotations}
            onAnnotationClick={onAnnotationClick}
            showAnnotations={true}
          />
        ) : (
          /* Placeholder when no model loaded */
          <group>
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[2, 1, 3]} />
              <meshStandardMaterial color="#8b7355" />
            </mesh>
            <mesh position={[0, 1.75, 0]} castShadow>
              <coneGeometry args={[1.8, 1.5, 4]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
          </group>
        )}
      </Canvas>

      {/* Model Library Modal */}
      {showLibrary && (
        <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Select a 3D Model</h2>
              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ModelLibrary onSelectAsset={handleAssetSelect} />
            </div>
          </div>
        </div>
      )}

      {/* Model Uploader Modal */}
      {showUploader && (
        <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-lg shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Upload 3D Model</h2>
                <button
                  type="button"
                  onClick={() => setShowUploader(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <ModelUploader
                onUpload={handleModelUpload}
                onCancel={() => setShowUploader(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Watermark */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
        PropertyManager 3D Viewer
      </div>
    </div>
  );
}
