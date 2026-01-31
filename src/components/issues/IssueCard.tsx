/**
 * IssueCard Component
 * Displays issue summary in list/kanban views
 */

import { useMemo } from 'react';
import { Clock, AlertTriangle, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Issue } from '../../types/issues.types';
import {
  ISSUE_STATUS_CONFIG,
  ISSUE_PRIORITY_CONFIG,
  ISSUE_CATEGORY_CONFIG,
} from '../../types/issues.types';
import { checkSLABreach } from '../../lib/issues';

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
  compact?: boolean;
  draggable?: boolean;
}

export default function IssueCard({
  issue,
  onClick,
  compact = false,
  draggable = false,
}: IssueCardProps) {
  const statusConfig = ISSUE_STATUS_CONFIG[issue.status];
  const priorityConfig = ISSUE_PRIORITY_CONFIG[issue.priority];
  const categoryConfig = ISSUE_CATEGORY_CONFIG[issue.category];

  const isBreached = useMemo(() => checkSLABreach(issue), [issue]);

  // Calculate time since reported
  const timeSinceReported = useMemo(() => {
    const reportedAt = new Date(issue.reportedAt).getTime();
    const now = Date.now();
    const hoursAgo = Math.floor((now - reportedAt) / (1000 * 60 * 60));

    if (hoursAgo < 1) return 'Just now';
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo === 1) return '1 day ago';
    return `${daysAgo} days ago`;
  }, [issue.reportedAt]);

  // Priority indicator colors
  const priorityColors = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-gray-400',
  };

  if (compact) {
    return (
      <div
        onClick={onClick}
        draggable={draggable}
        className={cn(
          'bg-cc-surface/80 border border-cc-border/50 rounded-lg p-3 cursor-pointer',
          'hover:border-cc-accent/50 hover:bg-cc-surface transition-all',
          draggable && 'hover:shadow-lg',
          isBreached && 'border-red-500/50 bg-red-500/5'
        )}
      >
        <div className="flex items-start gap-2">
          {/* Priority indicator */}
          <div
            className={cn('w-1 h-full min-h-[40px] rounded-full', priorityColors[issue.priority])}
          />

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className="text-sm font-medium text-cc-text truncate">{issue.title}</h4>

            {/* Category and time */}
            <div className="flex items-center gap-2 mt-1 text-xs text-cc-muted">
              <span>{categoryConfig.icon}</span>
              <span className="truncate">{categoryConfig.label}</span>
              <span className="text-cc-border">|</span>
              <Clock size={10} />
              <span>{timeSinceReported}</span>
            </div>

            {/* SLA Warning */}
            {isBreached && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
                <AlertTriangle size={10} />
                <span>SLA Breached</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      className={cn(
        'bg-cc-surface/80 border border-cc-border/50 rounded-lg p-4 cursor-pointer',
        'hover:border-cc-accent/50 hover:bg-cc-surface transition-all',
        draggable && 'hover:shadow-lg',
        isBreached && 'border-red-500/50 bg-red-500/5'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {/* Priority badge */}
          <span
            className={cn(
              'px-2 py-0.5 rounded text-xs font-medium',
              priorityConfig.bgColor,
              priorityConfig.color
            )}
          >
            {priorityConfig.label}
          </span>

          {/* Status badge */}
          <span
            className={cn(
              'px-2 py-0.5 rounded text-xs font-medium',
              statusConfig.bgColor,
              statusConfig.color
            )}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* SLA Warning */}
        {isBreached && (
          <div className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
            <AlertTriangle size={12} />
            <span>SLA</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-cc-text mb-2 line-clamp-2">{issue.title}</h3>

      {/* Description preview */}
      <p className="text-sm text-cc-muted line-clamp-2 mb-3">{issue.description}</p>

      {/* Category and Location */}
      <div className="flex items-center gap-3 text-xs text-cc-muted mb-3">
        <span className="flex items-center gap-1">
          <span>{categoryConfig.icon}</span>
          <span>{categoryConfig.label}</span>
        </span>
        {issue.location && (
          <>
            <span className="text-cc-border">|</span>
            <span>{issue.location}</span>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-cc-border/50">
        {/* Reporter */}
        <div className="flex items-center gap-2 text-xs text-cc-muted">
          <User size={12} />
          <span>{issue.reportedByName}</span>
          <span className="capitalize text-cc-border">({issue.reportedByRole})</span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 text-xs text-cc-muted">
          <Clock size={12} />
          <span>{timeSinceReported}</span>
        </div>
      </div>

      {/* Assignee (if assigned) */}
      {issue.assignedToName && (
        <div className="mt-2 pt-2 border-t border-cc-border/30 flex items-center gap-2 text-xs">
          <span className="text-cc-muted">Assigned to:</span>
          <span className="text-cc-accent font-medium">{issue.assignedToName}</span>
        </div>
      )}
    </div>
  );
}
