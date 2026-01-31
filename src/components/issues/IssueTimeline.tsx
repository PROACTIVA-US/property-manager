/**
 * IssueTimeline Component
 * Displays chronological activity history for an issue
 */

import { useMemo } from 'react';
import {
  MessageSquare,
  ArrowRight,
  User,
  Image,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Folder,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { IssueActivity } from '../../types/issues.types';

interface IssueTimelineProps {
  activities: IssueActivity[];
  maxHeight?: string;
}

export default function IssueTimeline({ activities, maxHeight = '400px' }: IssueTimelineProps) {
  // Sort activities newest first
  const sortedActivities = useMemo(() => {
    return [...activities].sort(
      (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
    );
  }, [activities]);

  const getActivityIcon = (type: IssueActivity['type']) => {
    switch (type) {
      case 'created':
        return <Plus size={14} />;
      case 'status_change':
        return <ArrowRight size={14} />;
      case 'priority_change':
        return <AlertTriangle size={14} />;
      case 'assigned':
      case 'reassigned':
        return <User size={14} />;
      case 'comment':
        return <MessageSquare size={14} />;
      case 'image_added':
        return <Image size={14} />;
      case 'scheduled':
        return <Calendar size={14} />;
      case 'escalated':
        return <AlertTriangle size={14} />;
      case 'resolved':
        return <CheckCircle size={14} />;
      case 'closed':
        return <XCircle size={14} />;
      case 'reopened':
        return <RefreshCw size={14} />;
      case 'converted_to_project':
        return <Folder size={14} />;
      default:
        return <ArrowRight size={14} />;
    }
  };

  const getActivityColor = (type: IssueActivity['type']) => {
    switch (type) {
      case 'created':
        return 'bg-blue-500/20 text-blue-400';
      case 'resolved':
        return 'bg-green-500/20 text-green-400';
      case 'closed':
        return 'bg-gray-500/20 text-gray-400';
      case 'escalated':
        return 'bg-red-500/20 text-red-400';
      case 'priority_change':
        return 'bg-orange-500/20 text-orange-400';
      case 'comment':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-cc-accent/20 text-cc-accent';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than 1 hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
    }

    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    // Less than 7 days
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }

    // Otherwise show date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (activities.length === 0) {
    return (
      <div className="text-center text-cc-muted py-8">
        <MessageSquare className="mx-auto mb-2 opacity-50" size={24} />
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto" style={{ maxHeight }}>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-cc-border/50" />

        {/* Activities */}
        <div className="space-y-4">
          {sortedActivities.map((activity) => (
            <div key={activity.id} className="relative flex gap-4">
              {/* Icon */}
              <div
                className={cn(
                  'relative z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0',
                  getActivityColor(activity.type)
                )}
              >
                {getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="bg-cc-bg/50 rounded-lg p-3 border border-cc-border/30">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-cc-text">
                      {activity.performedByName}
                    </span>
                    <span className="text-xs text-cc-muted">
                      {formatTimestamp(activity.performedAt)}
                    </span>
                  </div>

                  {/* Role badge */}
                  <span className="inline-block text-xs text-cc-muted bg-cc-border/30 px-1.5 py-0.5 rounded capitalize mb-2">
                    {activity.performedByRole}
                  </span>

                  {/* Description */}
                  <p className="text-sm text-cc-muted">{activity.description}</p>

                  {/* Metadata (for status/priority changes) */}
                  {activity.metadata && (activity.metadata.previousValue || activity.metadata.newValue) && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      {activity.metadata.previousValue && (
                        <span className="px-2 py-0.5 rounded bg-cc-border/30 text-cc-muted">
                          {activity.metadata.previousValue}
                        </span>
                      )}
                      {activity.metadata.previousValue && activity.metadata.newValue && (
                        <ArrowRight size={12} className="text-cc-muted" />
                      )}
                      {activity.metadata.newValue && (
                        <span className="px-2 py-0.5 rounded bg-cc-accent/20 text-cc-accent">
                          {activity.metadata.newValue}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
