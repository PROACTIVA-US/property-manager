/**
 * Issues Page
 * Main page for issue tracking system
 */

import { useState, useCallback } from 'react';
import { Plus, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getIssues, getIssuesByReporter, getIssueMetrics, generateSampleIssues, getEscalatedIssues } from '../lib/issues';
import type { Issue } from '../types/issues.types';
import IssueList from '../components/issues/IssueList';
import IssueCreateForm from '../components/issues/IssueCreateForm';
import IssueDetailModal from '../components/issues/IssueDetailModal';

// Helper function to load issues based on user role
function loadIssuesForUser(user: ReturnType<typeof useAuth>['user']) {
  // Generate sample issues on first load if none exist
  generateSampleIssues();

  const isOwner = user?.role === 'owner';
  const isTenant = user?.role === 'tenant';

  // Owners ONLY see escalated issues
  if (isOwner) {
    return getEscalatedIssues();
  } else if (isTenant && user) {
    // Tenants only see their own issues
    return getIssuesByReporter(user.uid);
  } else {
    // PM sees all issues
    return getIssues();
  }
}

export default function IssuesPage() {
  const { user } = useAuth();
  const isPM = user?.role === 'pm';
  const isOwner = user?.role === 'owner';
  const isTenant = user?.role === 'tenant';

  // Use lazy initialization
  const [issues, setIssues] = useState<Issue[]>(() => loadIssuesForUser(user));
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [metrics, setMetrics] = useState<ReturnType<typeof getIssueMetrics> | null>(() =>
    (isPM || isOwner) ? getIssueMetrics() : null
  );

  const loadIssues = useCallback(() => {
    setIssues(loadIssuesForUser(user));

    // Load metrics for PM/Owner
    if (isPM || isOwner) {
      setMetrics(getIssueMetrics());
    }
  }, [isPM, isOwner, user]);

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
  };

  const handleCreateClose = () => {
    setShowCreateForm(false);
  };

  const handleCreated = () => {
    loadIssues();
    setShowCreateForm(false);
  };

  const handleDetailClose = () => {
    setSelectedIssue(null);
  };

  const handleDetailUpdated = () => {
    loadIssues();
    // Refresh the selected issue if it's still open
    if (selectedIssue) {
      const updated = getIssues().find(i => i.id === selectedIssue.id);
      if (updated) {
        setSelectedIssue(updated);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cc-text">Issue Tracking</h1>
          <p className="text-cc-muted mt-1">
            {isTenant
              ? 'Report and track maintenance issues'
              : 'Manage and resolve property issues'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Report Issue
        </button>
      </div>

      {/* Metrics Dashboard (PM/Owner only) */}
      {metrics && (isPM || isOwner) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Open Issues */}
          <div className="card !p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <AlertTriangle size={16} />
              </div>
              <span className="text-xs text-cc-muted uppercase">Open</span>
            </div>
            <p className="text-2xl font-bold text-cc-text">{metrics.open}</p>
            <p className="text-xs text-cc-muted mt-1">Awaiting action</p>
          </div>

          {/* In Progress */}
          <div className="card !p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                <Clock size={16} />
              </div>
              <span className="text-xs text-cc-muted uppercase">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-cc-text">{metrics.inProgress}</p>
            <p className="text-xs text-cc-muted mt-1">Being worked on</p>
          </div>

          {/* Resolved */}
          <div className="card !p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                <CheckCircle size={16} />
              </div>
              <span className="text-xs text-cc-muted uppercase">Resolved</span>
            </div>
            <p className="text-2xl font-bold text-cc-text">{metrics.resolved}</p>
            <p className="text-xs text-cc-muted mt-1">Completed</p>
          </div>

          {/* Avg Resolution Time */}
          <div className="card !p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <TrendingUp size={16} />
              </div>
              <span className="text-xs text-cc-muted uppercase">Avg Resolution</span>
            </div>
            <p className="text-2xl font-bold text-cc-text">
              {metrics.averageResolutionHours < 24
                ? `${metrics.averageResolutionHours}h`
                : `${Math.round(metrics.averageResolutionHours / 24)}d`}
            </p>
            <p className="text-xs text-cc-muted mt-1">
              {metrics.slaBreachCount > 0 && (
                <span className="text-red-400">{metrics.slaBreachCount} SLA breaches</span>
              )}
              {metrics.slaBreachCount === 0 && 'All within SLA'}
            </p>
          </div>
        </div>
      )}

      {/* SLA Breach Warning */}
      {metrics && metrics.slaBreachCount > 0 && isPM && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="text-red-400 shrink-0" size={20} />
          <div>
            <p className="text-sm font-medium text-red-400">
              {metrics.slaBreachCount} issue{metrics.slaBreachCount !== 1 ? 's have' : ' has'} breached SLA
            </p>
            <p className="text-xs text-cc-muted mt-1">
              These issues have exceeded their target response time and require immediate attention.
            </p>
          </div>
        </div>
      )}

      {/* Issue List */}
      <IssueList
        issues={issues}
        onIssueClick={handleIssueClick}
        onRefresh={loadIssues}
      />

      {/* Create Issue Modal */}
      {showCreateForm && (
        <IssueCreateForm onClose={handleCreateClose} onCreated={handleCreated} />
      )}

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={handleDetailClose}
          onUpdated={handleDetailUpdated}
        />
      )}
    </div>
  );
}
