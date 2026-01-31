/**
 * IssueDetailModal Component
 * Full issue detail view with all information and actions
 */

import { useState, useMemo } from 'react';
import {
  X,
  Clock,
  User,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import type {
  Issue,
  IssueStatus,
  IssuePriority,
} from '../../types/issues.types';
import {
  ISSUE_STATUS_CONFIG,
  ISSUE_PRIORITY_CONFIG,
  ISSUE_CATEGORY_CONFIG,
  VALID_STATUS_TRANSITIONS,
} from '../../types/issues.types';
import { updateIssue, checkSLABreach } from '../../lib/issues';
import IssueTimeline from './IssueTimeline';
import IssueResolution from './IssueResolution';

interface IssueDetailModalProps {
  issue: Issue;
  onClose: () => void;
  onUpdated: () => void;
}

export default function IssueDetailModal({
  issue,
  onClose,
  onUpdated,
}: IssueDetailModalProps) {
  const { user } = useAuth();
  const isPM = user?.role === 'pm';
  const isOwner = user?.role === 'owner';

  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'resolution'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [showResolution, setShowResolution] = useState(false);

  const statusConfig = ISSUE_STATUS_CONFIG[issue.status];
  const priorityConfig = ISSUE_PRIORITY_CONFIG[issue.priority];
  const categoryConfig = ISSUE_CATEGORY_CONFIG[issue.category];

  const isBreached = useMemo(() => checkSLABreach(issue), [issue]);

  const canEdit = isPM || isOwner;
  const canResolve = isPM && ['assigned', 'in_progress', 'pending_approval'].includes(issue.status);

  // Get valid next statuses
  const validNextStatuses = useMemo(() => {
    const transitions = VALID_STATUS_TRANSITIONS[issue.status] || [];
    // Filter based on role
    if (!isPM) {
      return transitions.filter(s => s === 'closed' && isOwner);
    }
    return transitions;
  }, [issue.status, isPM, isOwner]);

  const handleStatusChange = (newStatus: IssueStatus) => {
    if (!user) return;

    updateIssue(
      issue.id,
      { status: newStatus },
      user.uid,
      user.displayName,
      user.role as 'owner' | 'pm' | 'tenant'
    );
    onUpdated();
  };

  const handlePriorityChange = (newPriority: IssuePriority) => {
    if (!user || !isPM) return;

    updateIssue(
      issue.id,
      { priority: newPriority },
      user.uid,
      user.displayName,
      user.role as 'owner' | 'pm' | 'tenant'
    );
    onUpdated();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-cc-surface border border-cc-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-cc-border bg-cc-bg/50">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  priorityConfig.bgColor,
                  priorityConfig.color
                )}
              >
                {priorityConfig.label}
              </span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  statusConfig.bgColor,
                  statusConfig.color
                )}
              >
                {statusConfig.label}
              </span>
              {isBreached && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                  <AlertTriangle size={12} />
                  SLA Breached
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-cc-text">{issue.title}</h2>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {canEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isEditing
                    ? 'bg-cc-accent text-white'
                    : 'text-cc-muted hover:text-cc-text hover:bg-cc-bg/50'
                )}
                title="Edit issue"
              >
                <Edit2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-cc-muted hover:text-cc-text rounded-lg hover:bg-cc-bg/50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cc-border px-6">
          {['details', 'timeline', 'resolution'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors capitalize',
                activeTab === tab
                  ? 'border-cc-accent text-cc-accent'
                  : 'border-transparent text-cc-muted hover:text-cc-text'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-cc-muted uppercase mb-2">
                    Description
                  </h3>
                  <p className="text-cc-text whitespace-pre-wrap">{issue.description}</p>
                </div>

                {/* Images */}
                {issue.images.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-cc-muted uppercase mb-2">
                      Photos ({issue.images.length})
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {issue.images.map(img => (
                        <div key={img.id} className="relative aspect-square">
                          <img
                            src={img.url}
                            alt={img.caption || 'Issue photo'}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <span
                            className={cn(
                              'absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-xs font-medium',
                              img.type === 'before'
                                ? 'bg-orange-500/80 text-white'
                                : img.type === 'after'
                                ? 'bg-green-500/80 text-white'
                                : 'bg-blue-500/80 text-white'
                            )}
                          >
                            {img.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions for PM */}
                {isPM && validNextStatuses.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-cc-muted uppercase mb-2">
                      Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {validNextStatuses.map(status => {
                        const config = ISSUE_STATUS_CONFIG[status];
                        return (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className={cn(
                              'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                              config.bgColor,
                              config.color,
                              'hover:opacity-80'
                            )}
                          >
                            <ChevronRight size={14} />
                            Move to {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Resolution form */}
                {canResolve && (
                  <div>
                    <button
                      onClick={() => setShowResolution(!showResolution)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Resolve Issue
                    </button>

                    {showResolution && (
                      <div className="mt-4">
                        <IssueResolution
                          issue={issue}
                          onResolved={() => {
                            setShowResolution(false);
                            onUpdated();
                          }}
                          onCancel={() => setShowResolution(false)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Category and Location */}
                <div className="bg-cc-bg/50 rounded-lg p-4 space-y-4">
                  <div>
                    <span className="text-xs text-cc-muted uppercase">Category</span>
                    <p className="text-cc-text font-medium">
                      {categoryConfig.icon} {categoryConfig.label}
                    </p>
                  </div>

                  {issue.location && (
                    <div>
                      <span className="text-xs text-cc-muted uppercase">Location</span>
                      <p className="text-cc-text font-medium flex items-center gap-1">
                        <MapPin size={14} className="text-cc-muted" />
                        {issue.location}
                      </p>
                    </div>
                  )}

                  {/* Priority (editable for PM) */}
                  <div>
                    <span className="text-xs text-cc-muted uppercase">Priority</span>
                    {isPM ? (
                      <select
                        value={issue.priority}
                        onChange={e => handlePriorityChange(e.target.value as IssuePriority)}
                        className="input-field w-full mt-1"
                      >
                        {Object.entries(ISSUE_PRIORITY_CONFIG).map(([value, config]) => (
                          <option key={value} value={value}>
                            {config.icon} {config.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-cc-text font-medium">
                        {priorityConfig.icon} {priorityConfig.label}
                      </p>
                    )}
                  </div>
                </div>

                {/* Reporter */}
                <div className="bg-cc-bg/50 rounded-lg p-4">
                  <span className="text-xs text-cc-muted uppercase">Reported by</span>
                  <div className="flex items-center gap-2 mt-1">
                    <User size={16} className="text-cc-muted" />
                    <span className="text-cc-text font-medium">{issue.reportedByName}</span>
                    <span className="text-xs text-cc-muted capitalize">
                      ({issue.reportedByRole})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-cc-muted">
                    <Clock size={12} />
                    {formatDate(issue.reportedAt)}
                  </div>
                </div>

                {/* Assignment */}
                {issue.assignedToName && (
                  <div className="bg-cc-bg/50 rounded-lg p-4">
                    <span className="text-xs text-cc-muted uppercase">Assigned to</span>
                    <p className="text-cc-accent font-medium">{issue.assignedToName}</p>
                    {issue.scheduledDate && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-cc-muted">
                        <Calendar size={14} />
                        Scheduled: {issue.scheduledDate}
                        {issue.scheduledTimeSlot && ` at ${issue.scheduledTimeSlot}`}
                      </div>
                    )}
                  </div>
                )}

                {/* Cost */}
                {(issue.estimatedCost || issue.actualCost) && (
                  <div className="bg-cc-bg/50 rounded-lg p-4">
                    <span className="text-xs text-cc-muted uppercase">Cost</span>
                    <div className="space-y-1 mt-1">
                      {issue.estimatedCost && (
                        <div className="flex justify-between text-sm">
                          <span className="text-cc-muted">Estimated:</span>
                          <span className="text-cc-text">${issue.estimatedCost.toLocaleString()}</span>
                        </div>
                      )}
                      {issue.actualCost && (
                        <div className="flex justify-between text-sm">
                          <span className="text-cc-muted">Actual:</span>
                          <span className="text-cc-text font-medium">
                            ${issue.actualCost.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {issue.costPaidBy && (
                        <div className="flex justify-between text-sm">
                          <span className="text-cc-muted">Paid by:</span>
                          <span className="text-cc-text capitalize">{issue.costPaidBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Resolution info */}
                {issue.resolvedAt && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <span className="text-xs text-green-600 uppercase">Resolved</span>
                    <div className="mt-1 text-sm text-cc-text">
                      {issue.resolutionNotes && (
                        <p className="mb-2">{issue.resolutionNotes}</p>
                      )}
                      <div className="text-xs text-cc-muted">
                        By {issue.resolvedByName} on {formatDate(issue.resolvedAt)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <IssueTimeline activities={issue.activities} />
          )}

          {activeTab === 'resolution' && (
            <div>
              {issue.status === 'resolved' || issue.status === 'closed' ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="text-green-500" size={24} />
                    <h3 className="text-lg font-medium text-cc-text">Issue Resolved</h3>
                  </div>
                  {issue.resolutionNotes && (
                    <div className="mb-4">
                      <span className="text-xs text-cc-muted uppercase">Resolution Notes</span>
                      <p className="text-cc-text mt-1">{issue.resolutionNotes}</p>
                    </div>
                  )}
                  {issue.actualCost !== undefined && (
                    <div className="mb-4">
                      <span className="text-xs text-cc-muted uppercase">Final Cost</span>
                      <p className="text-cc-text font-medium mt-1">
                        ${issue.actualCost.toLocaleString()}
                        {issue.costPaidBy && (
                          <span className="text-cc-muted font-normal">
                            {' '}(paid by {issue.costPaidBy})
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  <div className="text-sm text-cc-muted">
                    Resolved by {issue.resolvedByName} on {formatDate(issue.resolvedAt!)}
                  </div>
                </div>
              ) : canResolve ? (
                <IssueResolution
                  issue={issue}
                  onResolved={onUpdated}
                  onCancel={() => setActiveTab('details')}
                />
              ) : (
                <div className="text-center py-8 text-cc-muted">
                  <p>This issue has not been resolved yet.</p>
                  {!isPM && <p className="text-sm mt-2">Only property managers can resolve issues.</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
