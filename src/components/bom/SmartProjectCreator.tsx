import { useState } from 'react';
import { X, Sparkles, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { generateProject } from '../../lib/ai-generator';
import { saveBOM } from '../../lib/bom';
import { createProject } from '../../lib/projects';
import { useAuth } from '../../contexts/AuthContext';
import BOMDetailView from './BOMDetailView';
import type { ProjectGenerationRequest, GeneratedProject, PropertyContext, ProjectConstraints } from '../../types/ai.types';

interface SmartProjectCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function SmartProjectCreator({ isOpen, onClose, onSave }: SmartProjectCreatorProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'input' | 'generating' | 'review'>('input');
  const [description, setDescription] = useState('');
  const [propertyContext, setPropertyContext] = useState<Partial<PropertyContext>>({});
  const [constraints, setConstraints] = useState<Partial<ProjectConstraints>>({});
  const [generatedProject, setGeneratedProject] = useState<GeneratedProject | null>(null);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  // PM-only access control
  if (user?.role !== 'pm') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
          <div className="p-3 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-4">
            The AI Project Creator is only available to Property Managers.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please enter a project description');
      return;
    }

    setError('');
    setStep('generating');
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 300);

    try {
      const request: ProjectGenerationRequest = {
        description: description.trim(),
        propertyContext: Object.keys(propertyContext).length > 0 ? propertyContext as PropertyContext : undefined,
        constraints: Object.keys(constraints).length > 0 ? constraints as ProjectConstraints : undefined,
      };

      const response = await generateProject(request);

      clearInterval(progressInterval);
      setProgress(100);

      if (response.success && response.project) {
        setGeneratedProject(response.project);
        setStep('review');
      } else {
        setError(response.error?.message || 'Failed to generate project');
        setStep('input');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStep('input');
    }
  };

  const handleSaveProject = () => {
    if (!generatedProject || !user) return;

    try {
      // Create the project
      const project = createProject({
        title: generatedProject.title,
        description: generatedProject.description,
        category: generatedProject.category,
        status: generatedProject.status,
        priority: generatedProject.priority,
        estimatedCost: generatedProject.estimatedCost.totalCost,
        notes: generatedProject.aiNotes.join('\n'),
        tags: ['ai-generated'],
        additionalVendorIds: [],
        projectOwnerId: user.email,
        projectOwnerName: user.displayName || user.email,
        stakeholders: [],
        emergencyContacts: [],
        phases: generatedProject.phases.map((phase, index) => ({
          id: `phase-${index}`,
          name: phase.name,
          description: phase.description,
          startDate: '',
          endDate: '',
          status: 'pending' as const,
          progress: 0,
          order: index,
          milestones: phase.tasks.map((task, taskIndex) => ({
            id: `milestone-${index}-${taskIndex}`,
            name: task,
            description: '',
            dueDate: '',
            completed: false,
          })),
        })),
        messages: [],
        createdBy: user.email,
      });

      // Save the BOM linked to the project
      saveBOM({
        ...generatedProject.bom,
        projectId: project.id,
      });

      onSave();
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
    }
  };

  const resetForm = () => {
    setStep('input');
    setDescription('');
    setPropertyContext({});
    setConstraints({});
    setGeneratedProject(null);
    setError('');
    setProgress(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Project Creator</h2>
              <p className="text-sm text-gray-600">Describe your project and let AI do the planning</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'input' && (
            <div className="space-y-6">
              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Example: Build a 12x16 deck with stairs and railing..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={4}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Describe what you want to build or repair. Be as detailed as possible.
                </p>
              </div>

              {/* Property Context (Optional) */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Type
                    </label>
                    <select
                      value={propertyContext.propertyType || ''}
                      onChange={(e) => setPropertyContext({ ...propertyContext, propertyType: e.target.value as PropertyContext['propertyType'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select type...</option>
                      <option value="single_family">Single Family</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="condo">Condo</option>
                      <option value="apartment">Apartment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Square Footage
                    </label>
                    <input
                      type="number"
                      value={propertyContext.squareFootage || ''}
                      onChange={(e) => setPropertyContext({ ...propertyContext, squareFootage: parseInt(e.target.value) || undefined })}
                      placeholder="e.g., 2000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Constraints (Optional) */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Constraints (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Budget ($)
                    </label>
                    <input
                      type="number"
                      value={constraints.maxBudget || ''}
                      onChange={(e) => setConstraints({ ...constraints, maxBudget: parseFloat(e.target.value) || undefined })}
                      placeholder="e.g., 5000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DIY Level
                    </label>
                    <select
                      value={constraints.diyLevel || ''}
                      onChange={(e) => setConstraints({ ...constraints, diyLevel: e.target.value as ProjectConstraints['diyLevel'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select level...</option>
                      <option value="none">Hire Professionals</option>
                      <option value="basic">Basic DIY</option>
                      <option value="intermediate">Intermediate DIY</option>
                      <option value="advanced">Advanced DIY</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}

          {step === 'generating' && (
            <div className="py-12 text-center">
              <div className="flex justify-center mb-6">
                <Loader2 className="h-16 w-16 text-purple-600 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Generating Your Project Plan...
              </h3>
              <p className="text-gray-600 mb-6">
                AI is analyzing your requirements and creating a detailed plan
              </p>
              <div className="max-w-md mx-auto">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{progress}% complete</p>
              </div>
            </div>
          )}

          {step === 'review' && generatedProject && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Project plan generated successfully!</p>
                  <p className="text-xs text-green-700 mt-1">Review the details below and click Save to add to your projects.</p>
                </div>
              </div>

              {/* Project Overview */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{generatedProject.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{generatedProject.description}</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-2 font-medium text-gray-900 capitalize">{generatedProject.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Priority:</span>
                    <span className="ml-2 font-medium text-gray-900 capitalize">{generatedProject.priority}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-2 font-medium text-gray-900">{generatedProject.estimatedDuration}</span>
                  </div>
                </div>
              </div>

              {/* Phases */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Project Phases ({generatedProject.phases.length})</h4>
                <div className="space-y-2">
                  {generatedProject.phases.map((phase, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{phase.name}</h5>
                        <span className="text-xs text-gray-500">{phase.estimatedDays} days</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
                      <div className="text-xs text-gray-500">
                        {phase.tasks.length} tasks
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BOM */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Bill of Materials</h4>
                <BOMDetailView bom={generatedProject.bom} />
              </div>

              {/* Warnings */}
              {generatedProject.warnings.length > 0 && (
                <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-2">Important Warnings</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {generatedProject.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-yellow-800">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {step === 'input' && 'Fill in the details and click Generate'}
            {step === 'generating' && 'Please wait...'}
            {step === 'review' && 'Review the plan and save to your projects'}
          </div>
          <div className="flex space-x-3">
            {step === 'input' && (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Plan</span>
                </button>
              </>
            )}
            {step === 'review' && (
              <>
                <button
                  onClick={() => setStep('input')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSaveProject}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Save Project</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
