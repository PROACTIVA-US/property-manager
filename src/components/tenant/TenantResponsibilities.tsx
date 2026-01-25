import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getActiveResponsibilities,
  getPendingApprovals,
  getDueResponsibilities,
  tenantRespondToResponsibility,
  getCategoryLabel,
  getCategoryIcon,
  getFrequencyLabel,
  type TenantResponsibility,
  type ResponsibilityCategory,
} from '../../lib/tenant-responsibilities';
import { ResponsibilityChecklist } from './ResponsibilityChecklist';

export function TenantResponsibilities() {
  const { user: _user } = useAuth();
  const [responsibilities, setResponsibilities] = useState<TenantResponsibility[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<TenantResponsibility[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ResponsibilityCategory | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setResponsibilities(getActiveResponsibilities());
    setPendingApprovals(getPendingApprovals());
  };

  const handleApprove = (responsibilityId: string) => {
    tenantRespondToResponsibility(responsibilityId, true);
    loadData();
  };

  const handleReject = (responsibilityId: string, reason: string) => {
    if (!reason) {
      alert('Please provide a reason for rejecting');
      return;
    }
    tenantRespondToResponsibility(responsibilityId, false, reason);
    loadData();
  };

  const filteredResponsibilities = selectedCategory === 'all'
    ? responsibilities
    : responsibilities.filter(r => r.category === selectedCategory);

  const dueResponsibilities = getDueResponsibilities();

  // Group by category
  const categories = Array.from(
    new Set(responsibilities.map(r => r.category))
  ).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Responsibilities</h1>
        <p className="text-gray-600 mt-1">
          Maintenance tasks and responsibilities from your lease
        </p>
      </div>

      {/* Pending Approvals Banner */}
      {pendingApprovals.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                {pendingApprovals.length} New Responsibilit{pendingApprovals.length > 1 ? 'ies' : 'y'} Pending Approval
              </h3>
              <p className="text-sm text-yellow-800 mb-4">
                Your property manager has requested to add new maintenance responsibilities to your lease.
                Please review and approve or reject each one.
              </p>

              <div className="space-y-3">
                {pendingApprovals.map(responsibility => (
                  <ApprovalCard
                    key={responsibility.id}
                    responsibility={responsibility}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-3xl font-bold">{responsibilities.length}</p>
          <p className="text-sm text-blue-100 mt-1">Total Responsibilities</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6">
          <div className="text-3xl mb-2">⏰</div>
          <p className="text-3xl font-bold">{dueResponsibilities.length}</p>
          <p className="text-sm text-orange-100 mt-1">Due or Overdue</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-3xl font-bold">
            {responsibilities.filter(r => r.completionHistory.length > 0).length}
          </p>
          <p className="text-sm text-green-100 mt-1">Ever Completed</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({responsibilities.length})
            </button>
            {categories.map(category => {
              const count = responsibilities.filter(r => r.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-2 ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{getCategoryIcon(category)}</span>
                  <span>{getCategoryLabel(category)} ({count})</span>
                </button>
              );
            })}
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show completion history
          </label>
        </div>
      </div>

      {/* Responsibilities Checklist */}
      {filteredResponsibilities.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-3">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No responsibilities</h3>
          <p className="text-sm text-gray-500">
            {selectedCategory === 'all'
              ? "You don't have any active responsibilities yet"
              : `No responsibilities in the ${getCategoryLabel(selectedCategory)} category`}
          </p>
        </div>
      ) : (
        <ResponsibilityChecklist
          responsibilities={filteredResponsibilities}
          showCompleted={showCompleted}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}

// Approval Card Component
function ApprovalCard({
  responsibility,
  onApprove,
  onReject,
}: {
  responsibility: TenantResponsibility;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleRejectSubmit = () => {
    onReject(responsibility.id, rejectionReason);
    setShowRejectForm(false);
    setRejectionReason('');
  };

  return (
    <div className="bg-white border border-yellow-300 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{getCategoryIcon(responsibility.category)}</div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{responsibility.description}</h4>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                <span>{getCategoryLabel(responsibility.category)}</span>
                <span>•</span>
                <span>{getFrequencyLabel(responsibility.frequency)}</span>
              </div>
            </div>

            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              New
            </span>
          </div>

          {responsibility.pmNotes && (
            <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-1">Property Manager Notes:</p>
              <p className="text-sm text-gray-600">{responsibility.pmNotes}</p>
            </div>
          )}

          <div className="mt-3 text-xs text-gray-500">
            Requested by {responsibility.addedBy} on{' '}
            {responsibility.addedAt && new Date(responsibility.addedAt).toLocaleDateString()}
          </div>

          {showRejectForm ? (
            <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejecting (required):
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Please explain why you're rejecting this responsibility..."
              />
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={handleRejectSubmit}
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => onApprove(responsibility.id)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition"
              >
                ✗ Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
