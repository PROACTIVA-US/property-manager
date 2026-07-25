/**
 * IssueKanban Component
 * Kanban board view for issues
 */

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import type { Issue, IssueStatus } from '../../types/issues.types';
import { ISSUE_STATUS_CONFIG } from '../../types/issues.types';
import { updateIssue } from '../../lib/issues';
import IssueCard from './IssueCard';

interface IssueKanbanProps {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onRefresh: () => void;
}

// Kanban columns configuration
const KANBAN_COLUMNS: { status: IssueStatus; collapsible?: boolean }[] = [
  { status: 'open' },
  { status: 'triaged' },
  { status: 'assigned' },
  { status: 'in_progress' },
  { status: 'resolved', collapsible: true },
];

export default function IssueKanban({
  issues,
  onIssueClick,
  onRefresh,
}: IssueKanbanProps) {
  const { user } = useAuth();
  const isPM = user?.role === 'pm';

  const [collapsedColumns, setCollapsedColumns] = useState<Set<IssueStatus>>(new Set(['resolved']));
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);

  // Group issues by status
  const issuesByStatus = useMemo(() => {
    const groups: Record<IssueStatus, Issue[]> = {
      open: [],
      triaged: [],
      assigned: [],
      in_progress: [],
      pending_approval: [],
      resolved: [],
      closed: [],
      escalated: [],
    };

    issues.forEach(issue => {
      groups[issue.status].push(issue);
    });

    return groups;
  }, [issues]);

  const toggleColumn = (status: IssueStatus) => {
    setCollapsedColumns(prev => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, issue: Issue) => {
    if (!isPM) return;
    setDraggedIssue(issue);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isPM || !draggedIssue) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: IssueStatus) => {
    e.preventDefault();
    if (!isPM || !draggedIssue || !user) return;

    if (draggedIssue.status !== targetStatus) {
      updateIssue(
        draggedIssue.id,
        { status: targetStatus },
        user.uid,
        user.displayName,
        user.role as 'owner' | 'pm' | 'tenant'
      );
      onRefresh();
    }

    setDraggedIssue(null);
  };

  const handleDragEnd = () => {
    setDraggedIssue(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
      {KANBAN_COLUMNS.map(({ status, collapsible }) => {
        const config = ISSUE_STATUS_CONFIG[status];
        const columnIssues = issuesByStatus[status];
        const isCollapsed = collapsible && collapsedColumns.has(status);

        return (
          <div
            key={status}
            className={cn(
              'flex-shrink-0 flex flex-col bg-cc-bg/30 rounded-lg border border-cc-border/30',
              isCollapsed ? 'w-12' : 'w-72'
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column Header */}
            <div
              className={cn(
                'flex items-center gap-2 p-3 border-b border-cc-border/30',
                collapsible && 'cursor-pointer hover:bg-cc-surface/50'
              )}
              onClick={() => collapsible && toggleColumn(status)}
            >
              {isCollapsed ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <ChevronDown size={16} className="text-cc-muted" />
                  <span
                    className="text-xs font-medium text-cc-muted writing-mode-vertical"
                    style={{ writingMode: 'vertical-rl' }}
                  >
                    {config.label} ({columnIssues.length})
                  </span>
                </div>
              ) : (
                <>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      config.bgColor,
                      config.color
                    )}
                  >
                    {config.label}
                  </span>
                  <span className="text-sm text-cc-muted">({columnIssues.length})</span>
                  {collapsible && <ChevronUp size={16} className="ml-auto text-cc-muted" />}
                </>
              )}
            </div>

            {/* Column Content */}
            {!isCollapsed && (
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {columnIssues.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-cc-muted text-sm">
                    No issues
                  </div>
                ) : (
                  columnIssues.map(issue => (
                    <div
                      key={issue.id}
                      draggable={isPM}
                      onDragStart={(e) => handleDragStart(e, issue)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        draggedIssue?.id === issue.id && 'opacity-50'
                      )}
                    >
                      <IssueCard
                        issue={issue}
                        onClick={() => onIssueClick(issue)}
                        compact
                        draggable={isPM}
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Escalated column (if any) */}
      {issuesByStatus.escalated.length > 0 && (
        <div className="flex-shrink-0 w-72 flex flex-col bg-red-500/5 rounded-lg border border-red-500/30">
          <div className="flex items-center gap-2 p-3 border-b border-red-500/30">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
              Escalated
            </span>
            <span className="text-sm text-cc-muted">({issuesByStatus.escalated.length})</span>
          </div>
          <div className="flex-1 p-2 space-y-2 overflow-y-auto">
            {issuesByStatus.escalated.map(issue => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={() => onIssueClick(issue)}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
