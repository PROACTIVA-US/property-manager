import { useState, useEffect } from 'react';
import {
  Plus,
  GripVertical,
  // ChevronRight,
  AlertTriangle,
  Clock,
  User,
  Wrench,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  // MessageSquare,
  Sparkles,
} from 'lucide-react';
import {
  type Project,
  type ProjectStatus,
  KANBAN_STAGES,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
  getProjects,
  updateProject,
  deleteProject,
  getProjectStats,
} from '../lib/projects';
import { getVendorById } from '../lib/vendors';
import { cn } from '../lib/utils';
import ProjectDetailModal from './ProjectDetailModal';
import ProjectFormModal from './ProjectFormModal';
import SmartProjectCreator from './bom/SmartProjectCreator';

interface ProjectKanbanProps {
  compact?: boolean;
  onProjectSelect?: (project: Project) => void;
}

export default function ProjectKanban({ compact = false, onProjectSelect }: ProjectKanbanProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [dragOverStage, setDragOverStage] = useState<ProjectStatus | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isAICreatorOpen, setIsAICreatorOpen] = useState(false);

  // Which stages to show in compact mode
  const compactStages: ProjectStatus[] = ['pending_approval', 'approved', 'in_progress'];
  const displayStages = compact
    ? KANBAN_STAGES.filter(s => compactStages.includes(s.id))
    : KANBAN_STAGES.filter(s => s.id !== 'cancelled'); // Hide cancelled by default

  const loadProjects = () => {
    setProjects(getProjects());
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const getProjectsByStage = (status: ProjectStatus) => {
    return projects.filter(p => p.status === status);
  };

  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: ProjectStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(status);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: ProjectStatus) => {
    e.preventDefault();
    setDragOverStage(null);

    if (draggedProject && draggedProject.status !== newStatus) {
      // Validate status transition
      const validTransitions = getValidTransitions(draggedProject.status);
      if (validTransitions.includes(newStatus)) {
        updateProject(draggedProject.id, { status: newStatus });
        loadProjects();
      }
    }
    setDraggedProject(null);
  };

  const handleDragEnd = () => {
    setDraggedProject(null);
    setDragOverStage(null);
  };

  const getValidTransitions = (currentStatus: ProjectStatus): ProjectStatus[] => {
    // Define valid status transitions
    const transitions: Record<ProjectStatus, ProjectStatus[]> = {
      draft: ['pending_approval', 'cancelled'],
      pending_approval: ['approved', 'draft', 'cancelled'],
      approved: ['in_progress', 'on_hold', 'cancelled'],
      in_progress: ['completed', 'on_hold', 'cancelled'],
      on_hold: ['in_progress', 'cancelled'],
      completed: [], // Final state
      cancelled: [], // Final state
    };
    return transitions[currentStatus];
  };

  const handleProjectClick = (project: Project) => {
    if (onProjectSelect) {
      onProjectSelect(project);
    } else {
      setSelectedProject(project);
      setIsDetailOpen(true);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
    setMenuOpenId(null);
  };

  const handleDelete = (projectId: string) => {
    deleteProject(projectId);
    loadProjects();
    setDeleteConfirmId(null);
    setMenuOpenId(null);
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleFormSave = () => {
    loadProjects();
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleAICreatorOpen = () => {
    setIsAICreatorOpen(true);
  };

  const handleAICreatorSave = () => {
    loadProjects();
    setIsAICreatorOpen(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 bg-red-500/20';
      case 'high':
        return 'text-orange-400 bg-orange-500/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'low':
        return 'text-green-400 bg-green-500/20';
      default:
        return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getStageColor = (color: string) => {
    const colors: Record<string, string> = {
      slate: 'border-slate-500/50 bg-slate-500/10',
      yellow: 'border-yellow-500/50 bg-yellow-500/10',
      blue: 'border-blue-500/50 bg-blue-500/10',
      orange: 'border-brand-orange/50 bg-brand-orange/10',
      purple: 'border-purple-500/50 bg-purple-500/10',
      green: 'border-green-500/50 bg-green-500/10',
      red: 'border-red-500/50 bg-red-500/10',
    };
    return colors[color] || colors.slate;
  };

  const getStageHeaderColor = (color: string) => {
    const colors: Record<string, string> = {
      slate: 'text-slate-400',
      yellow: 'text-yellow-400',
      blue: 'text-blue-400',
      orange: 'text-brand-orange',
      purple: 'text-purple-400',
      green: 'text-green-400',
      red: 'text-red-400',
    };
    return colors[color] || colors.slate;
  };

  const stats = getProjectStats();

  if (compact) {
    // Compact horizontal card view for dashboard
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-brand-muted">
              {stats.activeCount} active project{stats.activeCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAICreatorOpen} className="btn-primary text-xs flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Sparkles size={14} />
              AI Create
            </button>
            <button onClick={handleAddProject} className="btn-primary text-xs flex items-center gap-1">
              <Plus size={14} />
              Manual
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayStages.map(stage => (
            <div key={stage.id} className={cn('rounded-lg border p-3', getStageColor(stage.color))}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={cn('text-sm font-semibold', getStageHeaderColor(stage.color))}>
                  {stage.label}
                </h4>
                <span className="text-xs text-brand-muted">
                  {getProjectsByStage(stage.id).length}
                </span>
              </div>

              <div className="space-y-2">
                {getProjectsByStage(stage.id).slice(0, 3).map(project => (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    className="bg-brand-dark/50 rounded-lg p-2 cursor-pointer hover:bg-brand-dark transition-colors"
                  >
                    <p className="text-sm font-medium text-brand-light truncate">
                      {project.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded', getPriorityColor(project.priority))}>
                        {PRIORITY_LABELS[project.priority]}
                      </span>
                      {project.primaryVendorId && (
                        <span className="text-[10px] text-brand-muted truncate">
                          {getVendorById(project.primaryVendorId)?.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {getProjectsByStage(stage.id).length > 3 && (
                  <p className="text-xs text-brand-muted text-center">
                    +{getProjectsByStage(stage.id).length - 3} more
                  </p>
                )}
                {getProjectsByStage(stage.id).length === 0 && (
                  <p className="text-xs text-brand-muted text-center py-2">No projects</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modals */}
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            isOpen={isDetailOpen}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedProject(null);
            }}
            onUpdate={loadProjects}
          />
        )}
        <ProjectFormModal
          project={editingProject}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProject(null);
          }}
          onSave={handleFormSave}
        />
        <SmartProjectCreator
          isOpen={isAICreatorOpen}
          onClose={() => setIsAICreatorOpen(false)}
          onSave={handleAICreatorSave}
        />
      </div>
    );
  }

  // Full Kanban board view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-light">Project Board</h2>
          <p className="text-sm text-brand-muted">
            {stats.activeCount} active, {stats.completedCount} completed
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAICreatorOpen}
            className="btn-primary flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Sparkles size={18} />
            Create with AI
          </button>
          <button onClick={handleAddProject} className="btn-secondary flex items-center gap-2">
            <Plus size={18} />
            New Project
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {displayStages.map(stage => (
          <div
            key={stage.id}
            className={cn(
              'flex-shrink-0 w-72 rounded-xl border-2 transition-colors',
              getStageColor(stage.color),
              dragOverStage === stage.id && 'ring-2 ring-brand-orange'
            )}
            onDragOver={e => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, stage.id)}
          >
            {/* Stage Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className={cn('font-semibold', getStageHeaderColor(stage.color))}>
                  {stage.label}
                </h3>
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-xs text-brand-light">
                  {getProjectsByStage(stage.id).length}
                </span>
              </div>
              <p className="text-xs text-brand-muted mt-1">{stage.description}</p>
            </div>

            {/* Project Cards */}
            <div className="p-3 space-y-3 min-h-[200px] max-h-[60vh] overflow-y-auto">
              {getProjectsByStage(stage.id).map(project => {
                const vendor = project.primaryVendorId
                  ? getVendorById(project.primaryVendorId)
                  : null;

                return (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={e => handleDragStart(e, project)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'bg-brand-dark rounded-lg p-3 cursor-grab active:cursor-grabbing',
                      'border border-white/10 hover:border-white/20 transition-all',
                      'shadow-lg hover:shadow-xl',
                      draggedProject?.id === project.id && 'opacity-50'
                    )}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <GripVertical size={14} className="text-brand-muted flex-shrink-0" />
                        <h4
                          className="font-medium text-brand-light truncate cursor-pointer hover:text-brand-orange"
                          onClick={() => handleProjectClick(project)}
                        >
                          {project.title}
                        </h4>
                      </div>

                      {/* Menu */}
                      <div className="relative">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === project.id ? null : project.id);
                          }}
                          className="p-1 text-brand-muted hover:text-brand-light rounded"
                        >
                          <MoreVertical size={14} />
                        </button>

                        {menuOpenId === project.id && (
                          <div className="absolute right-0 top-6 z-50 bg-brand-dark border border-white/20 rounded-lg shadow-xl py-1 min-w-[140px]">
                            <button
                              onClick={() => handleProjectClick(project)}
                              className="w-full px-3 py-2 text-left text-sm text-brand-light hover:bg-white/10 flex items-center gap-2"
                            >
                              <Eye size={14} />
                              View Details
                            </button>
                            <button
                              onClick={() => handleEdit(project)}
                              className="w-full px-3 py-2 text-left text-sm text-brand-light hover:bg-white/10 flex items-center gap-2"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(project.id)}
                              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}

                        {/* Delete Confirmation */}
                        {deleteConfirmId === project.id && (
                          <div className="absolute right-0 top-6 z-50 bg-brand-dark border border-red-500/30 rounded-lg shadow-xl p-3 min-w-[200px]">
                            <p className="text-sm text-red-400 mb-2">Delete this project?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDelete(project.id)}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-500"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category & Priority */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-brand-muted">
                        {CATEGORY_LABELS[project.category]}
                      </span>
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded', getPriorityColor(project.priority))}>
                        {PRIORITY_LABELS[project.priority]}
                      </span>
                      {project.impactAnalysis && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 flex items-center gap-0.5">
                          <Sparkles size={10} />
                          AI
                        </span>
                      )}
                    </div>

                    {/* Description Preview */}
                    <p className="text-xs text-brand-muted line-clamp-2 mb-3">
                      {project.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-brand-muted pt-2 border-t border-white/10">
                      {vendor ? (
                        <div className="flex items-center gap-1 truncate">
                          <Wrench size={12} />
                          <span className="truncate">{vendor.name}</span>
                        </div>
                      ) : (
                        <span className="text-brand-muted/50">No vendor</span>
                      )}

                      <div className="flex items-center gap-2">
                        {project.phases.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {project.phases.filter(p => p.status === 'completed').length}/{project.phases.length}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {project.stakeholders.length}
                        </span>
                      </div>
                    </div>

                    {/* Urgent indicator */}
                    {project.priority === 'urgent' && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-red-400">
                        <AlertTriangle size={12} />
                        <span>Urgent attention required</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {getProjectsByStage(stage.id).length === 0 && (
                <div className="text-center py-8 text-brand-muted text-sm">
                  No projects in this stage
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Click outside to close menu */}
      {menuOpenId && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)} />
      )}

      {/* Modals */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedProject(null);
          }}
          onUpdate={loadProjects}
        />
      )}
      <ProjectFormModal
        project={editingProject}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProject(null);
        }}
        onSave={handleFormSave}
      />
      <SmartProjectCreator
        isOpen={isAICreatorOpen}
        onClose={() => setIsAICreatorOpen(false)}
        onSave={handleAICreatorSave}
      />
    </div>
  );
}
