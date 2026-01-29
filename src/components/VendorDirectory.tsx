import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Phone,
  Mail,
  Edit2,
  Trash2,
  FileText,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Upload,
  Loader2,
} from 'lucide-react';
import {
  type Vendor,
  type VendorStatus,
  type VendorSpecialty,
  type Estimate,
  getVendors,
  deleteVendor,
  getEstimatesByVendor,
  createEstimate,
  deleteEstimate,
  SPECIALTY_LABELS,
  STATUS_LABELS,
} from '../lib/vendors';
import VendorForm from './VendorForm';
import { cn } from '../lib/utils';

interface VendorDirectoryProps {
  compact?: boolean;
}

export default function VendorDirectory({ compact = false }: VendorDirectoryProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VendorStatus | 'all'>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<VendorSpecialty | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);
  const [vendorEstimates, setVendorEstimates] = useState<Record<string, Estimate[]>>({});

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadVendors = () => {
    const loaded = getVendors();
    setVendors(loaded);
    setFilteredVendors(loaded);
  };

  useEffect(() => {
    loadVendors();
    setLoading(false);
  }, []);

  useEffect(() => {
    let result = vendors;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        v =>
          v.name.toLowerCase().includes(query) ||
          v.email.toLowerCase().includes(query) ||
          SPECIALTY_LABELS[v.specialty].toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(v => v.status === statusFilter);
    }

    // Specialty filter
    if (specialtyFilter !== 'all') {
      result = result.filter(v => v.specialty === specialtyFilter);
    }

    setFilteredVendors(result);
  }, [vendors, searchQuery, statusFilter, specialtyFilter]);

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedVendor(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteVendor(id);
    loadVendors();
    setDeleteConfirmId(null);
  };

  const handleFormSave = () => {
    loadVendors();
  };

  const toggleExpanded = (vendorId: string) => {
    if (expandedVendorId === vendorId) {
      setExpandedVendorId(null);
    } else {
      setExpandedVendorId(vendorId);
      // Load estimates for this vendor
      const estimates = getEstimatesByVendor(vendorId);
      setVendorEstimates(prev => ({ ...prev, [vendorId]: estimates }));
    }
  };

  const handleEstimateUpload = (vendorId: string, file: File) => {
    createEstimate({
      vendorId,
      fileName: file.name,
      fileSize: file.size,
      description: '',
    });
    // Reload estimates
    const estimates = getEstimatesByVendor(vendorId);
    setVendorEstimates(prev => ({ ...prev, [vendorId]: estimates }));
  };

  const handleEstimateDelete = (estimateId: string, vendorId: string) => {
    deleteEstimate(estimateId);
    const estimates = getEstimatesByVendor(vendorId);
    setVendorEstimates(prev => ({ ...prev, [vendorId]: estimates }));
  };

  const getStatusBadgeClass = (status: VendorStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-400';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400';
      case 'inactive':
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSpecialtyFilter('all');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || specialtyFilter !== 'all';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-cc-muted" size={24} />
        <span className="ml-2 text-cc-muted text-sm">Loading vendors...</span>
      </div>
    );
  }

  if (compact) {
    // Compact view for dashboard widget
    return (
      <div className="space-y-3">
        {vendors.slice(0, 3).map(vendor => (
          <div
            key={vendor.id}
            className="flex items-center justify-between p-2 rounded hover:bg-cc-bg/50 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-cc-text">{vendor.name}</p>
              <p className="text-xs text-cc-muted">{SPECIALTY_LABELS[vendor.specialty]}</p>
            </div>
            <span className={cn('text-[10px] px-2 py-0.5 rounded-full', getStatusBadgeClass(vendor.status))}>
              {STATUS_LABELS[vendor.status]}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-cc-text">Vendor Directory</h2>
          <p className="text-sm text-cc-muted">
            {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Vendor
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cc-muted" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search vendors..."
              className="input-field w-full pl-10"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'btn-secondary flex items-center gap-2',
              hasActiveFilters && 'border-cc-accent text-cc-accent'
            )}
          >
            <Filter size={18} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-cc-accent rounded-full" />
            )}
          </button>
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-cc-border/50">
            <div className="flex-1">
              <label className="block text-xs text-cc-muted mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as VendorStatus | 'all')}
                className="input-field w-full"
              >
                <option value="all">All Statuses</option>
                {(Object.keys(STATUS_LABELS) as VendorStatus[]).map(key => (
                  <option key={key} value={key}>
                    {STATUS_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs text-cc-muted mb-1">Specialty</label>
              <select
                value={specialtyFilter}
                onChange={e => setSpecialtyFilter(e.target.value as VendorSpecialty | 'all')}
                className="input-field w-full"
              >
                <option value="all">All Specialties</option>
                {(Object.keys(SPECIALTY_LABELS) as VendorSpecialty[]).map(key => (
                  <option key={key} value={key}>
                    {SPECIALTY_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="self-end btn-secondary text-sm flex items-center gap-1"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Vendor List */}
      <div className="space-y-3">
        {filteredVendors.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-cc-muted">No vendors found</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 text-sm text-cc-accent hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredVendors.map(vendor => (
            <div key={vendor.id} className="card">
              {/* Main vendor info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Avatar/Initial */}
                  <div className="w-12 h-12 rounded-lg bg-cc-bg flex items-center justify-center text-cc-accent font-bold text-lg flex-shrink-0">
                    {vendor.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-cc-text">{vendor.name}</h3>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', getStatusBadgeClass(vendor.status))}>
                        {STATUS_LABELS[vendor.status]}
                      </span>
                    </div>
                    <p className="text-sm text-cc-muted">{SPECIALTY_LABELS[vendor.specialty]}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                      <a
                        href={`tel:${vendor.phone}`}
                        className="flex items-center gap-1 text-cc-muted hover:text-cc-text transition-colors"
                      >
                        <Phone size={14} />
                        {vendor.phone}
                      </a>
                      <a
                        href={`mailto:${vendor.email}`}
                        className="flex items-center gap-1 text-cc-muted hover:text-cc-text transition-colors"
                      >
                        <Mail size={14} />
                        {vendor.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  <button
                    onClick={() => toggleExpanded(vendor.id)}
                    className="btn-secondary text-sm flex items-center gap-1"
                    title="View estimates"
                  >
                    <FileText size={16} />
                    Estimates
                    {expandedVendorId === vendor.id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(vendor)}
                    className="p-2 text-cc-muted hover:text-cc-text hover:bg-white/5 rounded-lg transition-colors"
                    title="Edit vendor"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(vendor.id)}
                    className="p-2 text-cc-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete vendor"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Notes */}
              {vendor.notes && (
                <div className="mt-3 pt-3 border-t border-cc-border/50">
                  <p className="text-sm text-cc-muted">{vendor.notes}</p>
                </div>
              )}

              {/* Expanded section - Estimates */}
              {expandedVendorId === vendor.id && (
                <div className="mt-4 pt-4 border-t border-cc-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-cc-text">Estimates</h4>
                    <label className="btn-secondary text-xs cursor-pointer flex items-center gap-1">
                      <Upload size={14} />
                      Upload Estimate
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleEstimateUpload(vendor.id, file);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>

                  {vendorEstimates[vendor.id]?.length > 0 ? (
                    <div className="space-y-2">
                      {vendorEstimates[vendor.id].map(estimate => (
                        <div
                          key={estimate.id}
                          className="flex items-center justify-between p-3 bg-cc-bg/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="text-cc-accent" size={20} />
                            <div>
                              <p className="text-sm font-medium text-cc-text">
                                {estimate.fileName}
                              </p>
                              <p className="text-xs text-cc-muted">
                                {formatFileSize(estimate.fileSize)} -{' '}
                                {new Date(estimate.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleEstimateDelete(estimate.id, vendor.id)}
                            className="p-1 text-cc-muted hover:text-red-400 transition-colors"
                            title="Delete estimate"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-cc-muted text-center py-4">
                      No estimates uploaded yet
                    </p>
                  )}
                </div>
              )}

              {/* Delete confirmation */}
              {deleteConfirmId === vendor.id && (
                <div className="mt-4 pt-4 border-t border-red-500/30 bg-red-500/10 -mx-6 -mb-6 px-6 pb-6 rounded-b-xl">
                  <p className="text-sm text-red-400 mb-3">
                    Are you sure you want to delete this vendor? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Vendor Form Modal */}
      <VendorForm
        vendor={selectedVendor}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleFormSave}
      />
    </div>
  );
}
