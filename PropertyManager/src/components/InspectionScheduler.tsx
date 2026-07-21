import { useState } from 'react';
import { Calendar, Clock, Check, Plus, X, Users, ChevronRight } from 'lucide-react';
import type { Inspection, ProposedTime } from '../lib/messages';
import { formatDate, formatRelativeTime, generateId } from '../lib/messages';
import { cn } from '../lib/utils';
import type { UserRole } from '../contexts/AuthContext';

interface InspectionSchedulerProps {
  inspections: Inspection[];
  currentUser: { id: string; role: UserRole; name: string };
  onCreateInspection: (inspection: Omit<Inspection, 'id' | 'createdAt'>) => void;
  onProposeTime: (inspectionId: string, time: number) => void;
  onVoteForTime: (inspectionId: string, timeId: string) => void;
  onConfirmTime: (inspectionId: string, timeId: string) => void;
}

export default function InspectionScheduler({
  inspections,
  currentUser,
  onCreateInspection,
  onProposeTime,
  onVoteForTime,
  onConfirmTime,
}: InspectionSchedulerProps) {
  const [showNewInspection, setShowNewInspection] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);

  const activeInspection = inspections.find(i => i.id === selectedInspection);

  const getStatusColor = (status: Inspection['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'confirmed':
        return 'bg-green-500/20 text-green-400';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-cc-border/50 text-slate-300';
    }
  };

  if (selectedInspection && activeInspection) {
    return (
      <InspectionDetail
        inspection={activeInspection}
        currentUser={currentUser}
        onBack={() => setSelectedInspection(null)}
        onProposeTime={(time) => onProposeTime(activeInspection.id, time)}
        onVoteForTime={(timeId) => onVoteForTime(activeInspection.id, timeId)}
        onConfirmTime={(timeId) => onConfirmTime(activeInspection.id, timeId)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-cc-text">Inspections & Scheduling</h2>
          <p className="text-sm text-cc-muted">Schedule and coordinate property inspections</p>
        </div>
        <button
          onClick={() => setShowNewInspection(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          New Inspection
        </button>
      </div>

      {/* Inspection List */}
      <div className="space-y-3">
        {inspections.length === 0 ? (
          <div className="text-center py-12 text-cc-muted">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No inspections scheduled</p>
            <p className="text-sm mt-1">Create a new inspection to get started</p>
          </div>
        ) : (
          inspections.map((inspection) => (
            <div
              key={inspection.id}
              onClick={() => setSelectedInspection(inspection.id)}
              className="card cursor-pointer hover:bg-cc-surface/70 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cc-accent/20 rounded-lg text-cc-accent">
                  <Calendar size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-cc-text truncate">{inspection.title}</h3>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium uppercase', getStatusColor(inspection.status))}>
                      {inspection.status}
                    </span>
                  </div>
                  <p className="text-sm text-cc-muted mt-1 line-clamp-1">{inspection.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-cc-muted">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      Proposed by {inspection.proposedBy.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {inspection.proposedTimes.length} time{inspection.proposedTimes.length !== 1 ? 's' : ''} proposed
                    </span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-cc-muted group-hover:text-cc-text transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Inspection Modal */}
      {showNewInspection && (
        <NewInspectionModal
          currentUser={currentUser}
          onClose={() => setShowNewInspection(false)}
          onCreate={(inspection) => {
            onCreateInspection(inspection);
            setShowNewInspection(false);
          }}
        />
      )}
    </div>
  );
}

// Inspection Detail View
interface InspectionDetailProps {
  inspection: Inspection;
  currentUser: { id: string; role: UserRole; name: string };
  onBack: () => void;
  onProposeTime: (time: number) => void;
  onVoteForTime: (timeId: string) => void;
  onConfirmTime: (timeId: string) => void;
}

function InspectionDetail({
  inspection,
  currentUser,
  onBack,
  onProposeTime,
  onVoteForTime,
  onConfirmTime,
}: InspectionDetailProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newTime, setNewTime] = useState('');

  const handleProposeTime = () => {
    if (newTime) {
      onProposeTime(new Date(newTime).getTime());
      setNewTime('');
      setShowTimePicker(false);
    }
  };

  const canConfirm = currentUser.role === 'pm' || currentUser.role === 'owner';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-cc-border/50 rounded-lg transition-colors text-cc-muted hover:text-cc-text"
        >
          <X size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-cc-text">{inspection.title}</h2>
          <p className="text-sm text-cc-muted">Created {formatRelativeTime(inspection.createdAt)}</p>
        </div>
      </div>

      {/* Description */}
      <div className="card">
        <h3 className="text-sm font-medium text-cc-muted uppercase tracking-wider mb-2">Description</h3>
        <p className="text-cc-text">{inspection.description}</p>
      </div>

      {/* Confirmed Time */}
      {inspection.confirmedTime && (
        <div className="card bg-green-900/30 border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
              <Check size={20} />
            </div>
            <div>
              <h3 className="font-bold text-green-400">Confirmed</h3>
              <p className="text-cc-text">{formatDate(inspection.confirmedTime)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Proposed Times */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-cc-muted uppercase tracking-wider">Proposed Times</h3>
          {inspection.status === 'pending' && (
            <button
              onClick={() => setShowTimePicker(!showTimePicker)}
              className="text-sm text-cc-accent hover:underline flex items-center gap-1"
            >
              <Plus size={14} />
              Propose Time
            </button>
          )}
        </div>

        {/* Time Picker */}
        {showTimePicker && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-cc-bg/50 rounded-lg">
            <input
              type="datetime-local"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="flex-1 input-field"
            />
            <button
              onClick={handleProposeTime}
              disabled={!newTime}
              className="btn-primary py-2"
            >
              Add
            </button>
          </div>
        )}

        {/* Time Options */}
        <div className="space-y-3">
          {inspection.proposedTimes.map((time) => {
            const hasVoted = time.votes.some(v => v.id === currentUser.id);
            const voteCount = time.votes.length;

            return (
              <div
                key={time.id}
                className={cn(
                  'p-4 rounded-lg border transition-colors',
                  hasVoted
                    ? 'bg-cc-accent/10 border-cc-accent/30'
                    : 'bg-cc-bg/50 border-cc-border hover:border-cc-border'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-cc-text">{formatDate(time.time)}</p>
                    <p className="text-xs text-cc-muted mt-1">
                      Proposed by {time.proposedBy.name} • {voteCount} vote{voteCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {canConfirm && inspection.status === 'pending' && (
                      <button
                        onClick={() => onConfirmTime(time.id)}
                        className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                      >
                        Confirm
                      </button>
                    )}
                    {!hasVoted && inspection.status === 'pending' && (
                      <button
                        onClick={() => onVoteForTime(time.id)}
                        className="text-xs px-3 py-1 rounded-full bg-cc-border text-cc-text hover:bg-cc-border transition-colors"
                      >
                        Vote
                      </button>
                    )}
                    {hasVoted && (
                      <span className="text-xs px-3 py-1 rounded-full bg-cc-accent/20 text-cc-accent">
                        Voted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {inspection.proposedTimes.length === 0 && (
            <p className="text-center text-cc-muted py-4">
              No times proposed yet. Be the first to suggest a time.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// New Inspection Modal
interface NewInspectionModalProps {
  currentUser: { id: string; role: UserRole; name: string };
  onClose: () => void;
  onCreate: (inspection: Omit<Inspection, 'id' | 'createdAt'>) => void;
}

function NewInspectionModal({ currentUser, onClose, onCreate }: NewInspectionModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proposedTime, setProposedTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim()) {
      const proposedTimes: ProposedTime[] = proposedTime
        ? [{
            id: generateId(),
            time: new Date(proposedTime).getTime(),
            proposedBy: currentUser,
            votes: [{ id: currentUser.id, role: currentUser.role }],
          }]
        : [];

      onCreate({
        title: title.trim(),
        description: description.trim(),
        proposedBy: currentUser,
        proposedTimes,
        status: 'pending',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-cc-surface border border-cc-border/50 rounded-xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cc-border/50">
          <h2 className="text-lg font-bold text-cc-text">Schedule New Inspection</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cc-border/50 rounded-lg transition-colors text-cc-muted hover:text-cc-text"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-cc-muted uppercase tracking-wider mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Quarterly Property Inspection"
              className="w-full input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-cc-muted uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what will be inspected..."
              rows={3}
              className="w-full input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-cc-muted uppercase tracking-wider mb-2">
              Suggest Initial Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={proposedTime}
              onChange={(e) => setProposedTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full input-field"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !description.trim()}
              className={cn(
                'btn-primary flex items-center gap-2',
                (!title.trim() || !description.trim()) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Calendar size={18} />
              Create Inspection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
