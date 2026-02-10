import { useState } from 'react';
import { Plus, ClipboardCheck, Calendar, CheckCircle, Clock, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import InspectionScheduler from '../components/InspectionScheduler';
import {
  getInspections,
  saveInspections,
  generateId,
  type Inspection,
  type ProposedTime,
} from '../lib/messages';

export default function Inspections() {
  const { user } = useAuth();
  // Use lazy initialization instead of effect
  const [inspections, setInspections] = useState<Inspection[]>(() => getInspections());
  const [activeTab, setActiveTab] = useState<'scheduled' | 'history'>('scheduled');
  const [showScheduler, setShowScheduler] = useState(false);

  const currentUser = {
    id: user?.uid || 'pm_1',
    role: (user?.role || 'pm') as 'owner' | 'pm' | 'tenant',
    name: user?.displayName || 'Property Manager',
  };

  const handleCreateInspection = (inspection: Omit<Inspection, 'id' | 'createdAt'>) => {
    const newInspection: Inspection = {
      ...inspection,
      id: generateId(),
      createdAt: Date.now(),
    };
    const updatedInspections = [newInspection, ...inspections];
    saveInspections(updatedInspections);
    setInspections(updatedInspections);
    setShowScheduler(false);
  };

  const handleProposeTime = (inspectionId: string, time: number) => {
    const updated = inspections.map(insp => {
      if (insp.id === inspectionId) {
        const newTime: ProposedTime = {
          id: generateId(),
          time,
          proposedBy: currentUser,
          votes: [{ id: currentUser.id, role: currentUser.role }],
        };
        return {
          ...insp,
          proposedTimes: [...insp.proposedTimes, newTime],
        };
      }
      return insp;
    });
    saveInspections(updated);
    setInspections(updated);
  };

  const handleVoteForTime = (inspectionId: string, timeId: string) => {
    const updated = inspections.map(insp => {
      if (insp.id === inspectionId) {
        return {
          ...insp,
          proposedTimes: insp.proposedTimes.map(pt => {
            if (pt.id === timeId && !pt.votes.some(v => v.id === currentUser.id)) {
              return {
                ...pt,
                votes: [...pt.votes, { id: currentUser.id, role: currentUser.role }],
              };
            }
            return pt;
          }),
        };
      }
      return insp;
    });
    saveInspections(updated);
    setInspections(updated);
  };

  const handleConfirmTime = (inspectionId: string, timeId: string) => {
    const updated = inspections.map(insp => {
      if (insp.id === inspectionId) {
        const confirmedTime = insp.proposedTimes.find(pt => pt.id === timeId);
        return {
          ...insp,
          status: 'confirmed' as const,
          confirmedTime: confirmedTime?.time,
        };
      }
      return insp;
    });
    saveInspections(updated);
    setInspections(updated);
  };

  const scheduledInspections = inspections.filter(
    i => i.status === 'pending' || i.status === 'confirmed'
  );
  const historyInspections = inspections.filter(
    i => i.status === 'completed' || i.status === 'cancelled'
  );

  const displayInspections = activeTab === 'scheduled' ? scheduledInspections : historyInspections;

  const getStatusIcon = (status: Inspection['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-400" />;
      case 'confirmed':
        return <Calendar size={16} className="text-blue-400" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'cancelled':
        return <X size={16} className="text-red-400" />;
    }
  };

  const getStatusBadge = (status: Inspection['status']) => {
    const base = 'px-2 py-0.5 text-[10px] font-bold uppercase rounded-full';
    switch (status) {
      case 'pending':
        return <span className={`${base} bg-yellow-500/20 text-yellow-400`}>Pending</span>;
      case 'confirmed':
        return <span className={`${base} bg-blue-500/20 text-blue-400`}>Confirmed</span>;
      case 'completed':
        return <span className={`${base} bg-green-500/20 text-green-400`}>Completed</span>;
      case 'cancelled':
        return <span className={`${base} bg-red-500/20 text-red-400`}>Cancelled</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cc-text">Property Inspections</h1>
          <p className="text-cc-muted">Schedule and track property inspections</p>
        </div>
        <button
          onClick={() => setShowScheduler(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Schedule Inspection
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-cc-muted uppercase">Total</p>
          <p className="text-2xl font-bold text-cc-text">{inspections.length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-cc-muted uppercase">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">
            {inspections.filter(i => i.status === 'pending').length}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-cc-muted uppercase">Confirmed</p>
          <p className="text-2xl font-bold text-blue-400">
            {inspections.filter(i => i.status === 'confirmed').length}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-cc-muted uppercase">Completed</p>
          <p className="text-2xl font-bold text-green-400">
            {inspections.filter(i => i.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-cc-border/50 pb-2">
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            activeTab === 'scheduled'
              ? 'bg-cc-accent text-white'
              : 'text-cc-muted hover:text-cc-text'
          }`}
        >
          Scheduled ({scheduledInspections.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-cc-accent text-white'
              : 'text-cc-muted hover:text-cc-text'
          }`}
        >
          History ({historyInspections.length})
        </button>
      </div>

      {/* Inspection List */}
      <div className="space-y-4">
        {displayInspections.length > 0 ? (
          displayInspections.map(inspection => (
            <div key={inspection.id} className="card hover:border-cc-accent/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cc-accent/20 rounded-lg text-cc-accent shrink-0">
                  <ClipboardCheck size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-cc-text">{inspection.title}</h3>
                    {getStatusBadge(inspection.status)}
                  </div>
                  <p className="text-sm text-cc-muted mt-1 line-clamp-2">
                    {inspection.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-cc-muted">
                    <span className="flex items-center gap-1">
                      {getStatusIcon(inspection.status)}
                      {inspection.confirmedTime
                        ? new Date(inspection.confirmedTime).toLocaleDateString()
                        : `${inspection.proposedTimes.length} times proposed`}
                    </span>
                    <span>Created by {inspection.proposedBy.name}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-cc-muted">
            <ClipboardCheck size={48} className="mx-auto mb-4 opacity-50" />
            <p>No {activeTab === 'scheduled' ? 'scheduled' : 'completed'} inspections</p>
            {activeTab === 'scheduled' && (
              <button
                onClick={() => setShowScheduler(true)}
                className="mt-4 text-cc-accent hover:underline"
              >
                Schedule your first inspection
              </button>
            )}
          </div>
        )}
      </div>

      {/* Inspection Scheduler Modal */}
      {showScheduler && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cc-surface border border-cc-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <InspectionScheduler
                inspections={inspections}
                currentUser={currentUser}
                onCreateInspection={handleCreateInspection}
                onProposeTime={handleProposeTime}
                onVoteForTime={handleVoteForTime}
                onConfirmTime={handleConfirmTime}
              />
            </div>
            <div className="border-t border-cc-border p-4">
              <button
                onClick={() => setShowScheduler(false)}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
