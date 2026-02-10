import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property3DViewer } from '../components/viewer3d/Property3DViewer';
import { getProjects } from '../lib/projects';
import type { Annotation, ViewerMode } from '../types/viewer3d.types';

// Helper function to convert projects to annotations
function projectsToAnnotations(): Annotation[] {
  const projects = getProjects();
  return projects
    .filter((project: { status: string }) => project.status !== 'completed')
    .map((project: { id: string; title: string; description: string; priority: string; status: string; createdAt: string; createdBy: string }, index: number) => ({
      id: project.id,
      projectId: project.id,
      position: [
        (index % 3) * 3 - 3,  // Spread annotations across x-axis
        2,
        Math.floor(index / 3) * 3,  // Spread across z-axis
      ] as [number, number, number],
      label: project.title,
      description: project.description,
      color: project.priority === 'high' ? '#ef4444' : project.priority === 'medium' ? '#f59e0b' : '#3b82f6',
      type: project.status === 'draft' ? 'proposed' : 'project',
      createdAt: project.createdAt,
      createdBy: project.createdBy,
    }));
}

/**
 * View3D Page
 *
 * Full-page 3D property viewer with property selection and project annotations.
 */
export default function View3D() {
  const navigate = useNavigate();
  const [selectedPropertyId] = useState<string>('property_1');
  // Use lazy initialization to load annotations - no effect needed
  const [annotations] = useState<Annotation[]>(() => projectsToAnnotations());
  const [mode, setMode] = useState<ViewerMode>('view');

  const handleAnnotationClick = (annotationId: string) => {
    const annotation = annotations.find((a) => a.id === annotationId);
    if (annotation?.projectId) {
      // Navigate to project detail (could open modal instead)
      navigate(`/projects?selected=${annotation.projectId}`);
    }
  };

  const handleAnnotationAdd = (newAnnotation: Omit<Annotation, 'id'>) => {
    // In a real app, this would create a new project
    console.log('Add annotation:', newAnnotation);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">3D Property Viewer</h1>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium">Active Projects:</span> {annotations.length}
          </div>
        </div>
      </header>

      {/* 3D Viewer */}
      <main className="flex-1 relative">
        {selectedPropertyId ? (
          <Property3DViewer
            propertyId={selectedPropertyId}
            annotations={annotations}
            mode={mode}
            onModeChange={setMode}
            onAnnotationClick={handleAnnotationClick}
            onAnnotationAdd={handleAnnotationAdd}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">🏠</div>
              <p>No property selected</p>
              <p className="text-sm mt-2">Please select a property to view in 3D</p>
            </div>
          </div>
        )}
      </main>

      {/* Help Panel */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center gap-8 text-sm text-gray-600">
          <div>
            <strong>Mouse Controls:</strong> Left-click + drag to rotate, Scroll to zoom, Right-click + drag to pan
          </div>
          <div>
            <strong>Tip:</strong> Click on project markers to view details
          </div>
        </div>
      </div>
    </div>
  );
}
