import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Wrench,
  Loader2,
  Phone,
  Mail,
  Star,
  AlertTriangle,
  Clock,
  User,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import {
  type Project,
  type ProjectStatus,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
  STATUS_LABELS,
  getProjectsAsync,
  deleteProjectAsync,
  getProjectStatsAsync,
} from '../lib/projects';
import {
  type Vendor,
  getVendorsAsync,
  SPECIALTY_LABELS,
  STATUS_LABELS as VENDOR_STATUS_LABELS,
} from '../lib/vendors';
import { cn } from '../lib/utils';
import ProjectDetailModal from '../components/ProjectDetailModal';
import ProjectFormModal from '../components/ProjectFormModal';
import SmartProjectCreator from '../components/bom/SmartProjectCreator';
import VendorForm from '../components/VendorForm';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Projects() {
  const { user } = useAuth();
  const isPM = user?.role === 'pm';
  const navigate = useNavigate();

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [stats, setStats] = useState({ activeCount: 0, completedCount: 0 });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAICreatorOpen, setIsAICreatorOpen] = useState(false);

  // Vendors state
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [isVendorFormOpen, setIsVendorFormOpen] = useState(false);

  // Vendor name cache for project cards
  const [vendorNameMap, setVendorNameMap] = useState<Record<string, string>>({});

  const loadProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const [projectsData, statsData] = await Promise.all([
        getProjectsAsync(),
        getProjectStatsAsync(),
      ]);
      setProjects(projectsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  const loadVendors = useCallback(async () => {
    setVendorsLoading(true);
    try {
      const data = await getVendorsAsync();
      setVendors(data);
      // Build name map for project cards
      const map: Record<string, string> = {};
      data.forEach(v => { map[v.id] = v.name; });
      setVendorNameMap(map);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setVendorsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
    loadVendors();
  }, [loadProjects, loadVendors]);

  // Project handlers
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsDetailOpen(true);
  };

  const handleNewProject = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleFormSave = async () => {
    await loadProjects();
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleAICreatorSave = async () => {
    await loadProjects();
    setIsAICreatorOpen(false);
  };

  // Vendor handlers
  const handleVendorClick = (vendor: Vendor) => {
    navigate(`/vendors/${vendor.id}`);
  };

  const handleAddVendor = () => {
    setIsVendorFormOpen(true);
  };

  const handleVendorFormSave = async () => {
    await loadVendors();
  };

  const getStatusColor = (status: ProjectStatus) => {
    const colors: Record<ProjectStatus, string> = {
      draft: 'bg-slate-500/20 text-slate-400',
      pending_approval: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-blue-500/20 text-blue-400',
      in_progress: 'bg-orange-500/20 text-cc-accent',
      on_hold: 'bg-purple-500/20 text-purple-400',
      completed: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400',
    };
    return colors[status];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-indigo-300 bg-indigo-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getVendorStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-400';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400';
      case 'inactive': return 'bg-slate-500/20 text-slate-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-cc-text">Projects & Vendors</h1>
        <p className="text-sm text-cc-muted mt-1">
          Manage your projects and vendor relationships
        </p>
      </div>

      {/* Two-column split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========== LEFT COLUMN: Vendors ========== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-cc-text flex items-center gap-2">
                <Wrench size={20} className="text-cc-accent" />
                Vendors
              </h2>
              <p className="text-xs text-cc-muted">
                {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button onClick={handleAddVendor} className="btn-primary text-sm flex items-center gap-1.5">
              <Plus size={16} />
              Add Vendor
            </button>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {vendorsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-cc-muted" size={20} />
                <span className="ml-2 text-cc-muted text-sm">Loading vendors...</span>
              </div>
            ) : vendors.length === 0 ? (
              <div className="card text-center py-12">
                <Wrench size={32} className="mx-auto text-cc-muted mb-3" />
                <p className="text-cc-muted">No vendors yet</p>
                <button onClick={handleAddVendor} className="mt-3 text-sm text-cc-accent hover:underline">
                  Add your first vendor
                </button>
              </div>
            ) : (
              vendors.map(vendor => (
                <div
                  key={vendor.id}
                  onClick={() => handleVendorClick(vendor)}
                  className={cn(
                    'card cursor-pointer transition-all group',
                    'hover:border-cc-accent/50 hover:shadow-lg hover:bg-cc-surface'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-lg bg-cc-bg flex items-center justify-center text-cc-accent font-bold text-sm flex-shrink-0">
                      {vendor.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="font-medium text-cc-text truncate">{vendor.name}</h3>
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0', getVendorStatusColor(vendor.status))}>
                            {VENDOR_STATUS_LABELS[vendor.status]}
                          </span>
                        </div>
                        <ChevronRight size={16} className="text-cc-muted group-hover:text-cc-accent flex-shrink-0 transition-colors" />
                      </div>

                      <p className="text-xs text-cc-muted mt-0.5">{SPECIALTY_LABELS[vendor.specialty]}</p>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-cc-muted">
                        {vendor.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={11} />
                            {vendor.phone}
                          </span>
                        )}
                        {vendor.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail size={11} />
                            {vendor.email}
                          </span>
                        )}
                      </div>

                      {vendor.averageRating && vendor.averageRating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={11}
                              className={i < Math.round(vendor.averageRating!) ? 'text-yellow-400 fill-yellow-400' : 'text-cc-muted'}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ========== RIGHT COLUMN: Projects ========== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-cc-text flex items-center gap-2">
                <Clock size={20} className="text-cc-accent" />
                Projects
              </h2>
              <p className="text-xs text-cc-muted">
                {stats.activeCount} active, {stats.completedCount} completed
              </p>
            </div>
            <div className="flex gap-2">
              {isPM && (
                <button
                  onClick={() => setIsAICreatorOpen(true)}
                  className="btn-primary text-sm flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Sparkles size={16} />
                  AI Create
                </button>
              )}
              <button onClick={handleNewProject} className="btn-secondary text-sm flex items-center gap-1.5">
                <Plus size={16} />
                New Project
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {projectsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-cc-muted" size={20} />
                <span className="ml-2 text-cc-muted text-sm">Loading projects...</span>
              </div>
            ) : projects.length === 0 ? (
              <div className="card text-center py-12">
                <Clock size={32} className="mx-auto text-cc-muted mb-3" />
                <p className="text-cc-muted">No projects yet</p>
                <button onClick={handleNewProject} className="mt-3 text-sm text-cc-accent hover:underline">
                  Create your first project
                </button>
              </div>
            ) : (
              projects.map(project => {
                const vendorName = project.primaryVendorId
                  ? vendorNameMap[project.primaryVendorId]
                  : null;

                return (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    className={cn(
                      'card cursor-pointer transition-all group',
                      'hover:border-cc-accent/50 hover:shadow-lg hover:bg-cc-surface'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-cc-text truncate">{project.title}</h3>
                          {project.impactAnalysis && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 flex items-center gap-0.5 flex-shrink-0">
                              <Sparkles size={10} />
                              AI
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-cc-muted mt-1 line-clamp-2">{project.description}</p>

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded', getStatusColor(project.status))}>
                            {STATUS_LABELS[project.status]}
                          </span>
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded', getPriorityColor(project.priority))}>
                            {PRIORITY_LABELS[project.priority]}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cc-border text-cc-muted">
                            {CATEGORY_LABELS[project.category]}
                          </span>
                        </div>

                        {/* Footer row */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-cc-muted">
                          {vendorName ? (
                            <span className="flex items-center gap-1 truncate">
                              <Wrench size={11} />
                              {vendorName}
                            </span>
                          ) : (
                            <span className="text-cc-muted/50 text-[10px]">No vendor assigned</span>
                          )}
                          {project.phases.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {project.phases.filter(p => p.status === 'completed').length}/{project.phases.length}
                            </span>
                          )}
                          {project.stakeholders.length > 0 && (
                            <span className="flex items-center gap-1">
                              <User size={11} />
                              {project.stakeholders.length}
                            </span>
                          )}
                        </div>

                        {project.priority === 'urgent' && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-red-400">
                            <AlertTriangle size={12} />
                            <span>Urgent</span>
                          </div>
                        )}
                      </div>

                      <ChevronRight size={16} className="text-cc-muted group-hover:text-cc-accent flex-shrink-0 mt-1 transition-colors" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ========== Modals ========== */}
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

      <VendorForm
        isOpen={isVendorFormOpen}
        onClose={() => setIsVendorFormOpen(false)}
        onSave={handleVendorFormSave}
      />
    </div>
  );
}
