import { useState } from 'react';
import {
  Wrench,
  ArrowLeft,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Camera,
  X,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import {
  getMaintenanceRequests,
  addMaintenanceRequest,
  formatDate,
  CATEGORY_LABELS,
  URGENCY_LABELS,
  STATUS_LABELS,
  type MaintenanceRequest as MaintenanceRequestType,
  type MaintenanceCategory,
  type MaintenanceUrgency,
  type MaintenanceStatus
} from '../lib/tenant';

interface MaintenanceRequestProps {
  onBack?: () => void;
}

export default function MaintenanceRequest({ onBack }: MaintenanceRequestProps) {
  const [requests, setRequests] = useState<MaintenanceRequestType[]>(getMaintenanceRequests());
  const [showForm, setShowForm] = useState(false);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [category, setCategory] = useState<MaintenanceCategory>('other');
  const [urgency, setUrgency] = useState<MaintenanceUrgency>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const openRequests = requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled');
  const completedRequests = requests.filter(r => r.status === 'completed' || r.status === 'cancelled');
  const displayRequests = showAllRequests ? requests : openRequests;

  const resetForm = () => {
    setCategory('other');
    setUrgency('medium');
    setTitle('');
    setDescription('');
    setPhotoPreview(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newRequest = addMaintenanceRequest({
      category,
      urgency,
      title: title.trim(),
      description: description.trim(),
      photoUrl: photoPreview || undefined,
    });

    console.log('Maintenance request submitted:', newRequest);

    setRequests(getMaintenanceRequests());
    setIsSubmitting(false);
    setShowSuccess(true);
    resetForm();

    setTimeout(() => setShowSuccess(false), 4000);
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusIcon = (status: MaintenanceStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} className="text-green-400" />;
      case 'in_progress':
        return <Loader2 size={18} className="text-blue-400" />;
      case 'scheduled':
        return <Calendar size={18} className="text-purple-400" />;
      case 'submitted':
        return <Clock size={18} className="text-yellow-400" />;
      case 'cancelled':
        return <X size={18} className="text-slate-400" />;
    }
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'scheduled':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'submitted':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getUrgencyColor = (urgency: MaintenanceUrgency) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-500/20 text-red-400';
      case 'high':
        return 'bg-indigo-400/20 text-indigo-300';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low':
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-cc-muted hover:text-cc-text transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cc-text">Maintenance Requests</h1>
          <p className="text-cc-muted mt-1">Submit and track maintenance issues</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            New Request
          </button>
        )}
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50">
          <CheckCircle size={24} />
          <div>
            <p className="font-bold">Request Submitted!</p>
            <p className="text-sm opacity-90">We'll notify you when it's scheduled.</p>
          </div>
        </div>
      )}

      {/* New Request Form */}
      {showForm && (
        <div className="card border-cc-accent/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-cc-text flex items-center gap-2">
              <Wrench size={20} className="text-cc-accent" />
              Submit New Request
            </h3>
            <button
              onClick={resetForm}
              className="text-cc-muted hover:text-cc-text transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-bold text-cc-muted uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(Object.keys(CATEGORY_LABELS) as MaintenanceCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      category === cat
                        ? 'bg-cc-accent/20 border-cc-accent text-cc-accent'
                        : 'bg-cc-bg/50 border-cc-border text-cc-muted hover:border-cc-border'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency Selection */}
            <div>
              <label className="block text-sm font-bold text-cc-muted uppercase tracking-wider mb-2">
                Urgency Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(Object.keys(URGENCY_LABELS) as MaintenanceUrgency[]).map((urg) => (
                  <button
                    key={urg}
                    type="button"
                    onClick={() => setUrgency(urg)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      urgency === urg
                        ? `${getUrgencyColor(urg)} border-current`
                        : 'bg-cc-bg/50 border-cc-border text-cc-muted hover:border-cc-border'
                    }`}
                  >
                    {URGENCY_LABELS[urg]}
                  </button>
                ))}
              </div>
              {urgency === 'emergency' && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  For life-threatening emergencies, call 911 first.
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-cc-muted uppercase tracking-wider mb-2">
                Issue Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the issue"
                className="input-field w-full"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-cc-muted uppercase tracking-wider mb-2">
                Detailed Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about the issue, when it started, and any relevant information..."
                rows={4}
                className="input-field w-full resize-none"
                required
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-bold text-cc-muted uppercase tracking-wider mb-2">
                Photo (Optional)
              </label>
              {photoPreview ? (
                <div className="flex items-center gap-4 p-4 bg-cc-bg/50 rounded-lg border border-cc-border">
                  <div className="w-16 h-16 bg-cc-border rounded-lg flex items-center justify-center">
                    <Camera size={24} className="text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-cc-text text-sm">Photo attached</p>
                    <p className="text-cc-muted text-xs">Click to change</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="text-cc-muted hover:text-red-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="w-full p-6 border-2 border-dashed border-cc-border rounded-lg hover:border-cc-border transition-colors text-cc-muted hover:text-cc-text cursor-pointer block">
                  <div className="flex flex-col items-center gap-2">
                    <Camera size={32} />
                    <span className="text-sm">Click to add a photo</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !description.trim()}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Wrench size={20} />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-cc-text">
            {showAllRequests ? 'All Requests' : 'Open Requests'}
            <span className="ml-2 text-sm font-normal text-cc-muted">
              ({showAllRequests ? requests.length : openRequests.length})
            </span>
          </h3>
          {completedRequests.length > 0 && (
            <button
              onClick={() => setShowAllRequests(!showAllRequests)}
              className="text-sm text-cc-muted hover:text-cc-text transition-colors flex items-center gap-1"
            >
              {showAllRequests ? (
                <>
                  <ChevronUp size={16} />
                  Hide Completed
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Show All ({requests.length})
                </>
              )}
            </button>
          )}
        </div>

        {displayRequests.length === 0 ? (
          <div className="text-center py-12 text-cc-muted">
            <Wrench size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium">No maintenance requests</p>
            <p className="text-sm mt-1">Submit a new request if you have any issues.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayRequests.map((request) => (
              <div
                key={request.id}
                className={`p-4 rounded-lg border ${getStatusColor(request.status)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(request.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-cc-text">{request.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getUrgencyColor(request.urgency)}`}>
                          {URGENCY_LABELS[request.urgency]}
                        </span>
                      </div>
                      <p className="text-sm text-cc-muted mt-1">{request.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-cc-muted">
                        <span className="flex items-center gap-1">
                          <Wrench size={12} />
                          {CATEGORY_LABELS[request.category]}
                        </span>
                        <span>Submitted: {formatDate(request.submittedDate)}</span>
                        {request.scheduledDate && (
                          <span className="text-purple-400">
                            Scheduled: {formatDate(request.scheduledDate)}
                          </span>
                        )}
                        {request.completedDate && (
                          <span className="text-green-400">
                            Completed: {formatDate(request.completedDate)}
                          </span>
                        )}
                      </div>
                      {request.notes && (
                        <div className="mt-3 p-3 bg-cc-bg/50 rounded-lg text-sm">
                          <p className="text-xs font-bold text-cc-muted uppercase mb-1">Notes from Maintenance:</p>
                          <p className="text-cc-text">{request.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-cc-bg/50 whitespace-nowrap">
                    {STATUS_LABELS[request.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
