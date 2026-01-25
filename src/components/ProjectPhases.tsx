import { useState } from 'react';
import { Plus, Check, Clock, Play, SkipForward, Calendar, Trash2 } from 'lucide-react';
import type { Project, ProjectPhase } from '../lib/projects';
import { updateProject } from '../lib/projects';
import { getVendorById } from '../lib/vendors';

interface ProjectPhasesProps {
  project: Project;
  onUpdate: () => void;
}

export default function ProjectPhases({ project, onUpdate }: ProjectPhasesProps) {
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    estimatedDays: '',
    assignedVendorId: '',
  });

  const phases = [...project.phases].sort((a, b) => a.order - b.order);

  const handleAddPhase = () => {
    if (!formData.name) return;

    const newPhase: ProjectPhase = {
      id: `phase_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      order: project.phases.length + 1,
      status: 'pending',
      estimatedDays: formData.estimatedDays ? parseInt(formData.estimatedDays) : undefined,
      assignedVendorId: formData.assignedVendorId || undefined,
    };

    updateProject(project.id, {
      phases: [...project.phases, newPhase],
    });

    setFormData({ name: '', description: '', estimatedDays: '', assignedVendorId: '' });
    setIsAddingPhase(false);
    onUpdate();
  };

  const handleUpdatePhaseStatus = (phaseId: string, status: ProjectPhase['status']) => {
    const updatedPhases = project.phases.map(p =>
      p.id === phaseId ? { ...p, status } : p
    );
    updateProject(project.id, { phases: updatedPhases });
    onUpdate();
  };

  const handleDeletePhase = (phaseId: string) => {
    const updatedPhases = project.phases.filter(p => p.id !== phaseId);
    updateProject(project.id, { phases: updatedPhases });
    onUpdate();
  };

  const getStatusIcon = (status: ProjectPhase['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="text-green-400" size={16} />;
      case 'in_progress':
        return <Play className="text-orange-400" size={16} />;
      case 'skipped':
        return <SkipForward className="text-slate-400" size={16} />;
      default:
        return <Clock className="text-brand-muted" size={16} />;
    }
  };

  const getStatusColor = (status: ProjectPhase['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'skipped':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-brand-dark text-brand-muted border-white/10';
    }
  };

  const completedCount = phases.filter(p => p.status === 'completed').length;
  const progress = phases.length > 0 ? (completedCount / phases.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-brand-dark rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-brand-light">Overall Progress</span>
          <span className="text-sm text-brand-muted">
            {completedCount} of {phases.length} completed
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="bg-brand-orange h-full transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Phases List */}
      <div className="space-y-3">
        {phases.map((phase, index) => {
          const vendor = phase.assignedVendorId ? getVendorById(phase.assignedVendorId) : null;

          return (
            <div
              key={phase.id}
              className={`rounded-lg p-4 border ${getStatusColor(phase.status)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-darker flex items-center justify-center text-xs font-bold text-brand-light">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(phase.status)}
                      <h4 className="font-semibold text-brand-light">{phase.name}</h4>
                    </div>
                    <p className="text-sm text-brand-muted mb-2">{phase.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-brand-muted">
                      {phase.estimatedDays && (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {phase.estimatedDays} days
                        </div>
                      )}
                      {vendor && (
                        <div>
                          Assigned to: <span className="text-brand-light">{vendor.name}</span>
                        </div>
                      )}
                      {phase.startDate && (
                        <div>
                          Started: {new Date(phase.startDate).toLocaleDateString()}
                        </div>
                      )}
                      {phase.endDate && (
                        <div>
                          Ended: {new Date(phase.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {phase.status === 'pending' && (
                    <button
                      onClick={() => handleUpdatePhaseStatus(phase.id, 'in_progress')}
                      className="px-2 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs"
                    >
                      Start
                    </button>
                  )}
                  {phase.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdatePhaseStatus(phase.id, 'completed')}
                      className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs"
                    >
                      Complete
                    </button>
                  )}
                  {phase.status === 'pending' && (
                    <button
                      onClick={() => handleUpdatePhaseStatus(phase.id, 'skipped')}
                      className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-xs"
                    >
                      Skip
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePhase(phase.id)}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {phases.length === 0 && !isAddingPhase && (
          <div className="text-center py-8 bg-brand-dark rounded-lg border border-white/10">
            <Clock size={32} className="mx-auto text-brand-muted mb-2" />
            <p className="text-brand-muted">No milestones yet</p>
          </div>
        )}
      </div>

      {/* Add Phase Form */}
      {isAddingPhase ? (
        <div className="bg-brand-dark rounded-lg p-4 border border-white/10">
          <h4 className="font-semibold text-brand-light mb-3">Add New Milestone</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-brand-muted mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="input-field w-full"
                placeholder="e.g., Install new HVAC unit"
              />
            </div>
            <div>
              <label className="block text-sm text-brand-muted mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="input-field w-full"
                rows={2}
                placeholder="Brief description of this milestone..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-brand-muted mb-1">Estimated Days</label>
                <input
                  type="number"
                  value={formData.estimatedDays}
                  onChange={e => setFormData({ ...formData, estimatedDays: e.target.value })}
                  className="input-field w-full"
                  placeholder="e.g., 5"
                />
              </div>
              <div>
                <label className="block text-sm text-brand-muted mb-1">Vendor (Optional)</label>
                <select
                  value={formData.assignedVendorId}
                  onChange={e => setFormData({ ...formData, assignedVendorId: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="">None</option>
                  {/* TODO: Add vendor options */}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddPhase} className="btn-primary">
                Add Milestone
              </button>
              <button
                onClick={() => {
                  setIsAddingPhase(false);
                  setFormData({ name: '', description: '', estimatedDays: '', assignedVendorId: '' });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingPhase(true)}
          className="w-full py-3 border-2 border-dashed border-white/20 rounded-lg text-brand-muted hover:text-brand-light hover:border-white/40 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Milestone
        </button>
      )}
    </div>
  );
}
