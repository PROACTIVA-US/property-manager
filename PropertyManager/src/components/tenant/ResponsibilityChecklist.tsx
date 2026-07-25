import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  completeResponsibility,
  updateResponsibility,
  getCategoryIcon,
  getFrequencyLabel,
  getDaysUntilDue,
  type TenantResponsibility,
} from '../../lib/tenant-responsibilities';

interface ResponsibilityChecklistProps {
  responsibilities: TenantResponsibility[];
  showCompleted?: boolean;
  onUpdate: () => void;
}

export function ResponsibilityChecklist({
  responsibilities,
  showCompleted = false,
  onUpdate,
}: ResponsibilityChecklistProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="divide-y divide-gray-200">
        {responsibilities.map(responsibility => (
          <ResponsibilityItem
            key={responsibility.id}
            responsibility={responsibility}
            showCompleted={showCompleted}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}

// Individual Responsibility Item
function ResponsibilityItem({
  responsibility,
  showCompleted,
  onUpdate,
}: {
  responsibility: TenantResponsibility;
  showCompleted: boolean;
  onUpdate: () => void;
}) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  const daysUntilDue = getDaysUntilDue(responsibility.lastCompletedAt, responsibility.frequency);
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
  const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7;

  const handleComplete = () => {
    if (!user) return;

    completeResponsibility(responsibility.id, user.displayName, completionNotes || undefined);
    setCompleting(false);
    setCompletionNotes('');
    onUpdate();
  };

  const handleToggleReminder = () => {
    updateResponsibility(responsibility.id, {
      reminderEnabled: !responsibility.reminderEnabled,
    });
    onUpdate();
  };

  return (
    <div className={`p-4 hover:bg-gray-50 transition ${isOverdue ? 'bg-red-50' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="text-3xl flex-shrink-0">
          {getCategoryIcon(responsibility.category)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">{responsibility.description}</h4>
              <div className="flex items-center gap-2 flex-wrap text-sm text-gray-600">
                <span>{getFrequencyLabel(responsibility.frequency)}</span>

                {responsibility.lastCompletedAt && (
                  <>
                    <span>•</span>
                    <span>
                      Last done: {new Date(responsibility.lastCompletedAt).toLocaleDateString()}
                    </span>
                  </>
                )}

                {daysUntilDue !== null && (
                  <>
                    <span>•</span>
                    <span className={isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-indigo-500 font-medium' : ''}>
                      {isOverdue
                        ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`
                        : isDueSoon
                        ? `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`
                        : `Due in ${daysUntilDue} days`}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {isOverdue && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  Overdue
                </span>
              )}
              {isDueSoon && !isOverdue && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                  Due Soon
                </span>
              )}
              {responsibility.source === 'pm_added' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  PM Added
                </span>
              )}
            </div>
          </div>

          {/* Completion Form */}
          {completing ? (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional):
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Add any notes about completing this task..."
              />
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleComplete}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  ✓ Mark Complete
                </button>
                <button
                  onClick={() => {
                    setCompleting(false);
                    setCompletionNotes('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompleting(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Mark as Done
              </button>

              {responsibility.completionHistory.length > 0 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
                >
                  {expanded ? 'Hide' : 'Show'} History ({responsibility.completionHistory.length})
                </button>
              )}

              <button
                onClick={handleToggleReminder}
                className={`px-3 py-2 rounded-lg text-sm transition ${
                  responsibility.reminderEnabled
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={responsibility.reminderEnabled ? 'Reminders enabled' : 'Reminders disabled'}
              >
                {responsibility.reminderEnabled ? '🔔' : '🔕'}
              </button>
            </div>
          )}

          {/* Completion History */}
          {expanded && showCompleted && responsibility.completionHistory.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h5 className="font-medium text-gray-900 mb-3 text-sm">Completion History</h5>
              <div className="space-y-2">
                {responsibility.completionHistory.slice(0, 5).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-start gap-3 p-3 bg-white rounded border border-gray-200"
                  >
                    <div className="text-green-600">✓</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-900">{record.completedBy}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">
                          {new Date(record.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
                {responsibility.completionHistory.length > 5 && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    +{responsibility.completionHistory.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
