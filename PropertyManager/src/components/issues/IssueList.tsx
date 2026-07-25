/**
 * IssueList Component
 * List view for issues with sorting and filtering
 */

import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  LayoutGrid,
  List,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Issue, IssueStatus, IssuePriority, IssueCategory, IssueFilters } from '../../types/issues.types';
import {
  ISSUE_STATUS_CONFIG,
  ISSUE_PRIORITY_CONFIG,
  ISSUE_CATEGORY_CONFIG,
} from '../../types/issues.types';
import IssueCard from './IssueCard';
import IssueKanban from './IssueKanban';

interface IssueListProps {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onRefresh: () => void;
}

type SortField = 'reportedAt' | 'priority' | 'status' | 'title';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'list' | 'kanban';

const priorityOrder: IssuePriority[] = ['urgent', 'high', 'medium', 'low'];
const statusOrder: IssueStatus[] = ['open', 'triaged', 'assigned', 'in_progress', 'pending_approval', 'escalated', 'resolved', 'closed'];

export default function IssueList({ issues, onIssueClick, onRefresh }: IssueListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('reportedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<IssueFilters>({
    status: [],
    priority: [],
    category: [],
    showClosed: false,
  });

  // Filter issues
  const filteredIssues = useMemo(() => {
    let result = [...issues];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        issue =>
          issue.title.toLowerCase().includes(query) ||
          issue.description.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      result = result.filter(issue => filters.status!.includes(issue.status));
    } else if (!filters.showClosed) {
      result = result.filter(issue => issue.status !== 'closed');
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      result = result.filter(issue => filters.priority!.includes(issue.priority));
    }

    // Category filter
    if (filters.category && filters.category.length > 0) {
      result = result.filter(issue => filters.category!.includes(issue.category));
    }

    return result;
  }, [issues, searchQuery, filters]);

  // Sort issues
  const sortedIssues = useMemo(() => {
    const sorted = [...filteredIssues];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'reportedAt':
          comparison = new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime();
          break;
        case 'priority':
          comparison = priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
          break;
        case 'status':
          comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredIssues, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleFilter = <T extends keyof IssueFilters>(
    filterKey: T,
    value: IssueFilters[T] extends (infer U)[] | undefined ? U : never
  ) => {
    setFilters(prev => {
      const currentValues = (prev[filterKey] as unknown[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [filterKey]: newValues };
    });
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      category: [],
      showClosed: false,
    });
    setSearchQuery('');
  };

  const activeFilterCount =
    (filters.status?.length || 0) +
    (filters.priority?.length || 0) +
    (filters.category?.length || 0);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cc-muted" />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field w-full pl-10"
          />
        </div>

        {/* Filter button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'btn-secondary flex items-center gap-2',
            showFilters && 'bg-cc-accent/10 border-cc-accent/50'
          )}
        >
          <Filter size={16} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-cc-accent text-white">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            size={16}
            className={cn('transition-transform', showFilters && 'rotate-180')}
          />
        </button>

        {/* View toggle */}
        <div className="flex items-center bg-cc-bg/50 rounded-lg border border-cc-border/50 p-1">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-md transition-colors',
              viewMode === 'list' ? 'bg-cc-accent text-white' : 'text-cc-muted hover:text-cc-text'
            )}
            title="List view"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={cn(
              'p-2 rounded-md transition-colors',
              viewMode === 'kanban' ? 'bg-cc-accent text-white' : 'text-cc-muted hover:text-cc-text'
            )}
            title="Kanban view"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-cc-text">Filters</h4>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-cc-accent hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status filter */}
            <div>
              <label className="text-xs font-medium text-cc-muted uppercase mb-2 block">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ISSUE_STATUS_CONFIG).map(([status, config]) => (
                  <button
                    key={status}
                    onClick={() => toggleFilter('status', status as IssueStatus)}
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium transition-all',
                      filters.status?.includes(status as IssueStatus)
                        ? `${config.bgColor} ${config.color}`
                        : 'bg-cc-border/30 text-cc-muted hover:bg-cc-border/50'
                    )}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority filter */}
            <div>
              <label className="text-xs font-medium text-cc-muted uppercase mb-2 block">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ISSUE_PRIORITY_CONFIG).map(([priority, config]) => (
                  <button
                    key={priority}
                    onClick={() => toggleFilter('priority', priority as IssuePriority)}
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium transition-all',
                      filters.priority?.includes(priority as IssuePriority)
                        ? `${config.bgColor} ${config.color}`
                        : 'bg-cc-border/30 text-cc-muted hover:bg-cc-border/50'
                    )}
                  >
                    {config.icon} {config.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <label className="text-xs font-medium text-cc-muted uppercase mb-2 block">
                Category
              </label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {Object.entries(ISSUE_CATEGORY_CONFIG).map(([category, config]) => (
                  <button
                    key={category}
                    onClick={() => toggleFilter('category', category as IssueCategory)}
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium transition-all',
                      filters.category?.includes(category as IssueCategory)
                        ? 'bg-cc-accent/20 text-cc-accent'
                        : 'bg-cc-border/30 text-cc-muted hover:bg-cc-border/50'
                    )}
                  >
                    {config.icon} {config.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Show closed toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showClosed}
              onChange={e => setFilters(prev => ({ ...prev, showClosed: e.target.checked }))}
              className="rounded border-cc-border text-cc-accent focus:ring-cc-accent"
            />
            <span className="text-sm text-cc-muted">Show closed issues</span>
          </label>
        </div>
      )}

      {/* Results info */}
      <div className="flex items-center justify-between text-sm text-cc-muted">
        <span>
          {sortedIssues.length} issue{sortedIssues.length !== 1 ? 's' : ''}
          {activeFilterCount > 0 && ` (filtered from ${issues.length})`}
        </span>

        {viewMode === 'list' && (
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase">Sort by:</span>
            <div className="flex gap-2">
              {[
                { field: 'reportedAt', label: 'Date' },
                { field: 'priority', label: 'Priority' },
                { field: 'status', label: 'Status' },
              ].map(({ field, label }) => (
                <button
                  key={field}
                  onClick={() => toggleSort(field as SortField)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                    sortField === field
                      ? 'bg-cc-accent/20 text-cc-accent'
                      : 'text-cc-muted hover:text-cc-text'
                  )}
                >
                  {label}
                  {sortField === field &&
                    (sortDirection === 'asc' ? <SortAsc size={12} /> : <SortDesc size={12} />)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {sortedIssues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-cc-muted">
          <Search size={48} className="mb-4 opacity-30" />
          <p className="text-lg font-medium">No issues found</p>
          <p className="text-sm">
            {activeFilterCount > 0 || searchQuery
              ? 'Try adjusting your filters or search query'
              : 'No issues have been reported yet'}
          </p>
        </div>
      ) : viewMode === 'kanban' ? (
        <IssueKanban
          issues={sortedIssues}
          onIssueClick={onIssueClick}
          onRefresh={onRefresh}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} onClick={() => onIssueClick(issue)} />
          ))}
        </div>
      )}
    </div>
  );
}
