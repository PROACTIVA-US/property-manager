import { Vector3 } from 'three';

/**
 * Phase 3: 3D Viewer Type Definitions
 *
 * This file defines all TypeScript interfaces and types for the 3D property viewer system.
 */

// ============================================================================
// Core Viewer Types
// ============================================================================

export type ViewerMode = 'view' | 'annotate' | 'edit';

export interface Property3DViewerProps {
  propertyId: string;
  modelUrl?: string;              // URL to GLTF/GLB model
  annotations: Annotation[];
  mode: ViewerMode;
  onAnnotationClick?: (id: string) => void;
  onAnnotationAdd?: (annotation: Omit<Annotation, 'id'>) => void;
  onAnnotationUpdate?: (id: string, updates: Partial<Annotation>) => void;
  onAnnotationDelete?: (id: string) => void;
  onModeChange?: (mode: ViewerMode) => void;
  className?: string;
}

// ============================================================================
// Annotation Types
// ============================================================================

export interface Annotation {
  id: string;
  projectId?: string;             // Link to project
  position: [number, number, number]; // 3D position (x, y, z)
  label: string;
  description?: string;
  color: string;                  // Hex color for marker
  type: AnnotationType;
  createdAt: string;
  createdBy: string;
  metadata?: Record<string, unknown>;
}

export type AnnotationType =
  | 'project'                     // Existing project
  | 'proposed'                    // Proposed change
  | 'issue'                       // Problem area
  | 'measurement'                 // Dimension marker
  | 'note';                       // General note

export interface AnnotationMarkerProps {
  annotation: Annotation;
  isSelected: boolean;
  onClick: (id: string) => void;
  showLabel: boolean;
}

// ============================================================================
// Model Types
// ============================================================================

export interface ModelAsset {
  id: string;
  name: string;
  description?: string;
  category: ModelCategory;
  thumbnail: string;              // URL to thumbnail image
  modelUrl: string;               // URL to GLTF/GLB file
  dimensions: {
    width: number;                // meters
    height: number;               // meters
    depth: number;                // meters
  };
  tags: string[];
  price?: number;                 // Estimated cost (optional)
  source: 'builtin' | 'uploaded' | 'library';
  createdAt?: string;
}

export type ModelCategory =
  | 'landscape'                   // Trees, shrubs, grass
  | 'structure'                   // Decks, fences, sheds
  | 'exterior'                    // Windows, doors, siding
  | 'interior'                    // Cabinets, fixtures
  | 'furniture'                   // Outdoor furniture
  | 'other';

export interface ModelLibraryProps {
  onSelectAsset: (asset: ModelAsset) => void;
  selectedCategory?: ModelCategory;
  onCategoryChange?: (category: ModelCategory) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

// ============================================================================
// Scene Control Types
// ============================================================================

export interface SceneControlsProps {
  enableRotate?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  minDistance?: number;
  maxDistance?: number;
  target?: Vector3;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

export interface CameraSettings {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;                    // Field of view
  near: number;
  far: number;
}

// ============================================================================
// Model Loading Types
// ============================================================================

export interface ModelViewerProps {
  modelUrl: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  annotations?: Annotation[];
  onAnnotationClick?: (id: string) => void;
  showAnnotations?: boolean;
}

export interface ModelLoadState {
  isLoading: boolean;
  error: Error | null;
  progress: number;               // 0-100
}

// ============================================================================
// Model Upload Types
// ============================================================================

export interface ModelUploadConfig {
  maxFileSize: number;            // bytes
  allowedFormats: string[];       // ['gltf', 'glb']
  compressionEnabled: boolean;
  generateThumbnail: boolean;
}

export interface ModelUploaderProps {
  onUpload: (file: File) => Promise<void>;
  onCancel?: () => void;
  config?: Partial<ModelUploadConfig>;
  isUploading?: boolean;
  uploadProgress?: number;
}

export interface UploadedModel {
  id: string;
  filename: string;
  fileSize: number;
  format: 'gltf' | 'glb';
  modelUrl: string;               // Data URL or storage URL
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
}

// ============================================================================
// Scene State Types
// ============================================================================

export interface SceneState {
  modelUrl: string | null;
  annotations: Annotation[];
  camera: CameraSettings;
  lighting: LightingSettings;
  grid: GridSettings;
  selectedAnnotationId: string | null;
  mode: ViewerMode;
}

export interface LightingSettings {
  ambient: {
    enabled: boolean;
    intensity: number;
    color: string;
  };
  directional: {
    enabled: boolean;
    intensity: number;
    color: string;
    position: [number, number, number];
  };
  hemisphere: {
    enabled: boolean;
    skyColor: string;
    groundColor: string;
    intensity: number;
  };
}

export interface GridSettings {
  enabled: boolean;
  size: number;                   // Grid size in meters
  divisions: number;              // Number of divisions
  color: string;
  centerColor: string;
}

// ============================================================================
// Performance Types
// ============================================================================

export interface PerformanceSettings {
  enableShadows: boolean;
  enableAntialiasing: boolean;
  pixelRatio: number;             // Device pixel ratio (1 or 2)
  maxTextureSize: number;
  lodEnabled: boolean;            // Level of Detail
  frustumCulling: boolean;
}

export interface PerformanceStats {
  fps: number;
  memory: number;                 // MB
  drawCalls: number;
  triangles: number;
}

// ============================================================================
// Export/Import Types
// ============================================================================

export interface SceneExport {
  version: string;                // Schema version
  propertyId: string;
  modelUrl: string | null;
  annotations: Annotation[];
  camera: CameraSettings;
  exportedAt: string;
  exportedBy: string;
}

export interface SceneImport {
  file: File;
  overwriteExisting: boolean;
}

// ============================================================================
// Default Configurations
// ============================================================================

export const DEFAULT_CAMERA_SETTINGS: CameraSettings = {
  position: [10, 10, 10],
  target: [0, 0, 0],
  fov: 50,
  near: 0.1,
  far: 1000,
};

export const DEFAULT_LIGHTING_SETTINGS: LightingSettings = {
  ambient: {
    enabled: true,
    intensity: 0.5,
    color: '#ffffff',
  },
  directional: {
    enabled: true,
    intensity: 1.0,
    color: '#ffffff',
    position: [10, 20, 10],
  },
  hemisphere: {
    enabled: false,
    skyColor: '#87ceeb',
    groundColor: '#8b7355',
    intensity: 0.6,
  },
};

export const DEFAULT_GRID_SETTINGS: GridSettings = {
  enabled: true,
  size: 20,
  divisions: 20,
  color: '#888888',
  centerColor: '#444444',
};

export const DEFAULT_PERFORMANCE_SETTINGS: PerformanceSettings = {
  enableShadows: true,
  enableAntialiasing: true,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
  maxTextureSize: 2048,
  lodEnabled: false,
  frustumCulling: true,
};

export const DEFAULT_UPLOAD_CONFIG: ModelUploadConfig = {
  maxFileSize: 50 * 1024 * 1024,  // 50 MB
  allowedFormats: ['gltf', 'glb'],
  compressionEnabled: false,
  generateThumbnail: true,
};
