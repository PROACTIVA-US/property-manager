import { Clock, Wrench, Building2, Package, Users } from 'lucide-react';
import { useRecentActivity } from '../../hooks/useRecentActivity';
import type { ActivityItem } from '../../hooks/useRecentActivity';
import { useNavigate } from 'react-router-dom';

export default function RecentActivitySection() {
  const { activities, loading, error } = useRecentActivity(8);
  const navigate = useNavigate();

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'project':
        return Wrench;
      case 'property':
        return Building2;
      case 'bom':
        return Package;
      case 'vendor':
        return Users;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'project':
        return 'text-orange-400 bg-orange-500/10';
      case 'property':
        return 'text-blue-400 bg-blue-500/10';
      case 'bom':
        return 'text-green-400 bg-green-500/10';
      case 'vendor':
        return 'text-purple-400 bg-purple-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'text-gray-400';
    const lower = status.toLowerCase();
    if (lower === 'completed' || lower === 'done') return 'text-green-400';
    if (lower === 'in progress' || lower === 'active') return 'text-blue-400';
    if (lower === 'pending' || lower === 'planned') return 'text-yellow-400';
    return 'text-gray-400';
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.type === 'project') {
      navigate('/projects');
    } else if (activity.type === 'property') {
      navigate('/properties');
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Recent Activity</h2>
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <span className="ml-3 text-gray-400">Loading activity...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Recent Activity</h2>
        <div className="bg-red-500/10 rounded-lg border border-red-500/30 p-8">
          <p className="text-red-400 text-center">Failed to load activity: {error}</p>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Recent Activity</h2>
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-8">
          <div className="text-center">
            <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No recent activity</p>
            <p className="text-sm text-gray-500">
              Create your first project or add a property to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Recent Activity</h2>
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 divide-y divide-gray-700">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type);

          return (
            <button
              key={activity.id}
              onClick={() => handleActivityClick(activity)}
              className="w-full flex items-start gap-4 p-4 hover:bg-gray-700/30 transition-colors text-left"
            >
              <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-100 mb-1">{activity.title}</h3>
                {activity.description && (
                  <p className="text-sm text-gray-400 mb-2 line-clamp-1">
                    {activity.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs">
                  {activity.status && (
                    <span className={`${getStatusColor(activity.status)} font-medium`}>
                      {activity.status}
                    </span>
                  )}
                  <span className="text-gray-500">
                    {formatDate(activity.updatedAt || activity.createdAt)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
