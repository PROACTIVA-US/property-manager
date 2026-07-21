import { useState, useRef } from 'react';
import type { ModelUploaderProps, UploadedModel } from '../../types/viewer3d.types';
import {
  DEFAULT_UPLOAD_CONFIG,
  isValidModelFormat,
  formatFileSize,
  generateModelId,
  saveUploadedModel,
} from '../../lib/model-library';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ModelUploader Component
 *
 * Provides UI for uploading 3D model files (GLTF/GLB).
 * Supports drag-and-drop and file selection.
 */
export function ModelUploader({
  onUpload,
  onCancel,
  config = {},
  isUploading: externalIsUploading,
  uploadProgress: externalUploadProgress,
}: ModelUploaderProps) {
  const { user } = useAuth();
  const [isDragOver, setIsDragOver] = useState(false);
  const [internalIsUploading, setInternalIsUploading] = useState(false);
  const [internalProgress, setInternalProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = externalIsUploading ?? internalIsUploading;
  const uploadProgress = externalUploadProgress ?? internalProgress;

  const uploadConfig = { ...DEFAULT_UPLOAD_CONFIG, ...config };

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check format
    if (!isValidModelFormat(file.name)) {
      return `Invalid file format. Allowed formats: ${uploadConfig.allowedFormats.join(', ')}`;
    }

    // Check file size
    if (file.size > uploadConfig.maxFileSize) {
      return `File too large. Maximum size: ${formatFileSize(uploadConfig.maxFileSize)}`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setInternalIsUploading(true);
    setInternalProgress(0);

    try {
      // Read file as data URL
      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setInternalProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;

        if (dataUrl) {
          setPreview(dataUrl);

          // Create uploaded model record
          const uploadedModel: UploadedModel = {
            id: generateModelId(),
            filename: file.name,
            fileSize: file.size,
            format: file.name.toLowerCase().endsWith('.glb') ? 'glb' : 'gltf',
            modelUrl: dataUrl,
            uploadedAt: new Date().toISOString(),
            uploadedBy: user?.email || 'unknown',
          };

          // Save to localStorage
          saveUploadedModel(uploadedModel);

          // Call parent onUpload handler
          await onUpload(file);

          setInternalProgress(100);
          setTimeout(() => {
            setInternalIsUploading(false);
            setInternalProgress(0);
            setPreview(null);
          }, 1000);
        }
      };

      reader.onerror = () => {
        setError('Failed to read file');
        setInternalIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setInternalIsUploading(false);
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Upload 3D Model</h3>

      {/* Drag and Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8
          transition-all duration-200
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isUploading ? handleBrowseClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".gltf,.glb"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="text-center">
          {isUploading ? (
            <>
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-700 mb-2">Uploading...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{uploadProgress}%</p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">📦</div>
              <p className="text-gray-700 mb-2">
                Drag and drop a 3D model file here
              </p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Browse Files
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Supported formats: {uploadConfig.allowedFormats.join(', ').toUpperCase()}
                <br />
                Max file size: {formatFileSize(uploadConfig.maxFileSize)}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Preview */}
      {preview && !error && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm flex items-center gap-2">
            <span>✓</span>
            Model uploaded successfully!
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Tips for best results:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Use GLTF (.gltf) or GLB (.glb) format for best compatibility</li>
          <li>Optimize your models before uploading (reduce polygon count)</li>
          <li>Include textures and materials in the file when possible</li>
          <li>Test models in a 3D viewer before uploading</li>
        </ul>
      </div>
    </div>
  );
}
