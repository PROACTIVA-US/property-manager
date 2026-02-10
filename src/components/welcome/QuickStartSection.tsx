import { Sparkles, Building2, Wrench, Plus, Eye, Bell, FileText, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth, type UserRole } from '../../contexts/AuthContext';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
  hoverBgColor: string;
  action: () => void;
  roles: UserRole[];
}

export default function QuickStartSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const quickActions: QuickAction[] = [
    // PM-only actions
    {
      id: 'create-ai-project',
      title: 'Create Project with AI',
      description: 'Describe your project and get instant plans with materials list',
      icon: Sparkles,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      hoverBgColor: 'hover:bg-purple-500/20',
      action: () => navigate('/projects'),
      roles: ['pm'],
    },
    {
      id: 'add-property',
      title: 'Add Property',
      description: 'Register a new property to your portfolio',
      icon: Plus,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-500/10',
      hoverBgColor: 'hover:bg-green-500/20',
      action: () => navigate('/properties'),
      roles: ['pm'],
    },
    {
      id: 'view-properties',
      title: 'View Properties',
      description: 'Browse your property portfolio and recent updates',
      icon: Building2,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      hoverBgColor: 'hover:bg-blue-500/20',
      action: () => navigate('/properties'),
      roles: ['pm'],
    },
    {
      id: 'view-3d',
      title: 'View 3D Models',
      description: 'Explore interactive 3D property visualizations',
      icon: Eye,
      iconColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      hoverBgColor: 'hover:bg-cyan-500/20',
      action: () => navigate('/3d-view'),
      roles: ['pm'],
    },
    {
      id: 'manage-projects',
      title: 'Manage Projects',
      description: 'Track maintenance and improvement projects',
      icon: Wrench,
      iconColor: 'text-indigo-300',
      bgColor: 'bg-indigo-400/10',
      hoverBgColor: 'hover:bg-indigo-400/20',
      action: () => navigate('/projects'),
      roles: ['pm'],
    },
    // Owner-specific actions
    {
      id: 'notifications',
      title: 'Notifications',
      description: '',
      icon: Bell,
      iconColor: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      hoverBgColor: 'hover:bg-pink-500/20',
      action: () => {}, // TODO: Implement notification center
      roles: ['owner'],
    },
    {
      id: 'view-projects-owner',
      title: 'Maintenance',
      description: '',
      icon: Wrench,
      iconColor: 'text-indigo-300',
      bgColor: 'bg-indigo-400/10',
      hoverBgColor: 'hover:bg-indigo-400/20',
      action: () => navigate('/maintenance'),
      roles: ['owner'],
    },
    {
      id: 'view-financials',
      title: 'Financials',
      description: '',
      icon: DollarSign,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-500/10',
      hoverBgColor: 'hover:bg-green-500/20',
      action: () => navigate('/financials'),
      roles: ['owner'],
    },
    {
      id: 'view-lease',
      title: 'Lease Info',
      description: '',
      icon: FileText,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      hoverBgColor: 'hover:bg-blue-500/20',
      action: () => navigate('/tenants'),
      roles: ['owner'],
    },
    // Tenant-specific actions
    {
      id: 'report-issue',
      title: 'Report Issue',
      description: 'Submit maintenance requests to your property manager',
      icon: Wrench,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-500/10',
      hoverBgColor: 'hover:bg-red-500/20',
      action: () => navigate('/maintenance'),
      roles: ['tenant'],
    },
    {
      id: 'view-lease-tenant',
      title: 'View Lease',
      description: 'Access your lease agreement and rental details',
      icon: FileText,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      hoverBgColor: 'hover:bg-blue-500/20',
      action: () => navigate('/documents'),
      roles: ['tenant'],
    },
    // Shared actions (all roles except owner who has it in owner-specific)
    {
      id: 'notifications-shared',
      title: 'Check Notifications',
      description: 'Stay updated on property and project alerts',
      icon: Bell,
      iconColor: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      hoverBgColor: 'hover:bg-pink-500/20',
      action: () => {}, // TODO: Implement notification center
      roles: ['pm', 'tenant'],
    },
  ];

  // Filter actions based on user role
  const filteredActions = quickActions.filter(action =>
    user?.role && action.roles.includes(user.role)
  );

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-cc-text mb-4">Quick Start</h2>
      <div className={`grid gap-4 ${user?.role === 'owner' ? 'grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredActions.map((action) => {
          const Icon = action.icon;
          const isHovered = hoveredAction === action.id;

          return (
            <button
              key={action.id}
              onClick={action.action}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
              className={`group relative flex items-start gap-4 p-4 rounded-lg border border-cc-border ${action.bgColor} ${action.hoverBgColor} transition-all text-left`}
            >
              <div className={`p-2 ${action.bgColor} rounded-lg`}>
                <Icon className={`w-5 h-5 ${action.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-cc-text mb-1">{action.title}</h3>
                {action.description && (
                  <p className="text-sm text-cc-muted">{action.description}</p>
                )}
              </div>
              <ArrowRight
                className={`w-4 h-4 text-cc-muted transition-opacity absolute top-4 right-4 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
