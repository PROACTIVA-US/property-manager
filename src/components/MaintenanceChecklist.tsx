import { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar,
  AlertTriangle,
  Clock,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCheck,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  type MaintenanceTask,
  type TaskCategory,
  type TaskFrequency,
  loadTasks,
  toggleTaskCompletion,
  addTask,
  updateTask,
  deleteTask,
  completeAllInCategory,
  resetCategoryTasks,
  getTaskStats,
  getCategoryStats,
  getDaysUntilDue,
  isTaskOverdue,
  isTaskUpcoming,
  CATEGORY_ORDER,
  CATEGORY_INFO,
  getCurrentDate,
} from '../lib/maintenance';

type FilterStatus = 'all' | 'pending' | 'completed' | 'overdue' | 'upcoming';

interface TaskFormData {
  description: string;
  category: TaskCategory;
  frequency: TaskFrequency;
  dueDate: string;
  notes: string;
}

const INITIAL_FORM_DATA: TaskFormData = {
  description: '',
  category: 'Monthly Routine',
  frequency: 'Monthly',
  dueDate: '',
  notes: '',
};

export default function MaintenanceChecklist() {
  const { user } = useAuth();
  const isPM = user?.role === 'pm';

  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<TaskCategory>>(
    new Set(CATEGORY_ORDER)
  );
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  const [formData, setFormData] = useState<TaskFormData>(INITIAL_FORM_DATA);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load tasks on mount
  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  // Filter tasks based on selected filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Category filter
      if (filterCategory !== 'all' && task.category !== filterCategory) {
        return false;
      }

      // Status filter
      switch (filterStatus) {
        case 'pending':
          return !task.completed;
        case 'completed':
          return task.completed;
        case 'overdue':
          return isTaskOverdue(task);
        case 'upcoming':
          return isTaskUpcoming(task);
        default:
          return true;
      }
    });
  }, [tasks, filterStatus, filterCategory]);

  // Group filtered tasks by category
  const tasksByCategory = useMemo(() => {
    const grouped: Record<TaskCategory, MaintenanceTask[]> = {
      'Monthly Routine': [],
      'Quarterly Routine': [],
      'Bi-Annual/Seasonal': [],
      'Annual Routine': [],
      'Major Project Planning': [],
    };

    filteredTasks.forEach(task => {
      grouped[task.category].push(task);
    });

    return grouped;
  }, [filteredTasks]);

  const stats = useMemo(() => getTaskStats(tasks), [tasks]);

  const toggleCategory = (category: TaskCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(toggleTaskCompletion(tasks, taskId));
  };

  const handleCompleteCategory = (category: TaskCategory) => {
    setTasks(completeAllInCategory(tasks, category));
  };

  const handleResetCategory = (category: TaskCategory) => {
    setTasks(resetCategoryTasks(tasks, category));
  };

  const handleOpenAddModal = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditingTask(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (task: MaintenanceTask) => {
    setFormData({
      description: task.description,
      category: task.category,
      frequency: task.frequency,
      dueDate: task.dueDate || '',
      notes: task.notes || '',
    });
    setEditingTask(task);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingTask(null);
    setFormData(INITIAL_FORM_DATA);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) return;

    if (editingTask) {
      // Update existing task
      setTasks(
        updateTask(tasks, editingTask.id, {
          description: formData.description.trim(),
          category: formData.category,
          frequency: formData.frequency,
          dueDate: formData.dueDate || undefined,
          notes: formData.notes.trim() || undefined,
        })
      );
    } else {
      // Add new task
      setTasks(
        addTask(tasks, {
          description: formData.description.trim(),
          category: formData.category,
          frequency: formData.frequency,
          dueDate: formData.dueDate || undefined,
          notes: formData.notes.trim() || undefined,
        })
      );
    }

    handleCloseModal();
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(deleteTask(tasks, taskId));
    setDeleteConfirm(null);
  };

  const getDueDateDisplay = (task: MaintenanceTask) => {
    if (!task.dueDate) return null;

    const daysUntil = getDaysUntilDue(task.dueDate);
    const isOverdue = daysUntil < 0;
    const isUpcoming = daysUntil >= 0 && daysUntil <= 7;

    let colorClass = 'text-brand-muted';
    let Icon = Calendar;

    if (task.completed) {
      colorClass = 'text-brand-muted';
    } else if (isOverdue) {
      colorClass = 'text-red-400';
      Icon = AlertTriangle;
    } else if (isUpcoming) {
      colorClass = 'text-amber-400';
      Icon = Clock;
    }

    const displayText = isOverdue
      ? `${Math.abs(daysUntil)} days overdue`
      : daysUntil === 0
        ? 'Due today'
        : daysUntil === 1
          ? 'Due tomorrow'
          : `Due in ${daysUntil} days`;

    return (
      <span className={`text-xs flex items-center ${colorClass}`}>
        <Icon size={10} className="mr-1" />
        {displayText}
      </span>
    );
  };

  return (
    <div className="card h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-brand-orange">Maintenance Checklist</h2>
          <p className="text-sm text-brand-muted mt-1">
            {stats.completed}/{stats.total} completed
            {stats.overdue > 0 && (
              <span className="text-red-400 ml-2">({stats.overdue} overdue)</span>
            )}
            {stats.upcoming > 0 && (
              <span className="text-amber-400 ml-2">({stats.upcoming} upcoming)</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isPM && (
            <button
              onClick={handleOpenAddModal}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-brand-dark/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-brand-muted" />
          <span className="text-xs text-brand-muted">Filter:</span>
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as FilterStatus)}
          className="input-field text-xs py-1 px-2"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
          <option value="upcoming">Due Soon</option>
        </select>

        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value as TaskCategory | 'all')}
          className="input-field text-xs py-1 px-2"
        >
          <option value="all">All Categories</option>
          {CATEGORY_ORDER.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {(filterStatus !== 'all' || filterCategory !== 'all') && (
          <button
            onClick={() => {
              setFilterStatus('all');
              setFilterCategory('all');
            }}
            className="text-xs text-brand-orange hover:text-orange-400"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Task Categories */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
        {CATEGORY_ORDER.map(category => {
          const categoryTasks = tasksByCategory[category];
          const isExpanded = expandedCategories.has(category);
          const categoryStats = getCategoryStats(tasks, category);

          // Skip empty categories when filtering
          if (categoryTasks.length === 0 && filterCategory === 'all' && filterStatus !== 'all') {
            return null;
          }

          return (
            <div key={category} className="border border-slate-700/50 rounded-lg overflow-hidden">
              {/* Category Header */}
              <div
                className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                  isExpanded ? 'bg-brand-dark/50' : 'bg-brand-dark/30 hover:bg-brand-dark/40'
                }`}
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-brand-muted" />
                  ) : (
                    <ChevronDown size={16} className="text-brand-muted" />
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-brand-light">{category}</h3>
                    <p className="text-xs text-brand-muted">{CATEGORY_INFO[category].timing}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-brand-muted bg-brand-dark px-2 py-1 rounded">
                    {categoryStats.completed}/{categoryStats.total}
                  </span>

                  {isPM && isExpanded && (
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleCompleteCategory(category)}
                        className="p-1.5 text-brand-muted hover:text-green-400 hover:bg-green-400/10 rounded transition-colors"
                        title="Complete all"
                      >
                        <CheckCheck size={14} />
                      </button>
                      <button
                        onClick={() => handleResetCategory(category)}
                        className="p-1.5 text-brand-muted hover:text-amber-400 hover:bg-amber-400/10 rounded transition-colors"
                        title="Reset all"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Tasks */}
              {isExpanded && (
                <div className="p-2 space-y-2">
                  {categoryTasks.length === 0 ? (
                    <p className="text-xs text-brand-muted text-center py-4">
                      No tasks match the current filters
                    </p>
                  ) : (
                    categoryTasks.map(task => (
                      <div
                        key={task.id}
                        className={`flex items-start p-3 rounded-lg transition-all border ${
                          task.completed
                            ? 'bg-green-900/10 border-green-900/30 opacity-60'
                            : isTaskOverdue(task)
                              ? 'bg-red-900/10 border-red-900/30'
                              : isTaskUpcoming(task)
                                ? 'bg-amber-900/10 border-amber-900/30'
                                : 'bg-brand-dark/30 border-slate-700/50 hover:bg-brand-dark/50 hover:border-brand-orange/50'
                        }`}
                      >
                        {/* Checkbox */}
                        <div
                          onClick={() => handleToggleTask(task.id)}
                          className={`mt-0.5 mr-3 cursor-pointer ${
                            task.completed ? 'text-green-500' : 'text-brand-muted hover:text-brand-orange'
                          }`}
                        >
                          {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </div>

                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              task.completed ? 'line-through text-brand-muted' : 'text-brand-light'
                            }`}
                          >
                            {task.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-brand-muted bg-brand-dark px-1.5 py-0.5 rounded">
                              {task.frequency}
                            </span>
                            {getDueDateDisplay(task)}
                            {task.notes && (
                              <span className="text-xs text-brand-muted italic truncate max-w-[150px]">
                                {task.notes}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* PM Actions */}
                        {isPM && (
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleOpenEditModal(task)}
                              className="p-1.5 text-brand-muted hover:text-brand-orange hover:bg-brand-orange/10 rounded transition-colors"
                              title="Edit task"
                            >
                              <Pencil size={14} />
                            </button>

                            {deleteConfirm === task.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors text-xs"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="p-1.5 text-brand-muted hover:bg-brand-dark rounded transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(task.id)}
                                className="p-1.5 text-brand-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                title="Delete task"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-brand-navy border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-brand-orange">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-brand-muted hover:text-brand-light transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-sm text-brand-light mb-1">Description *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="input-field w-full"
                  placeholder="Enter task description"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-brand-light mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                    className="input-field w-full"
                  >
                    {CATEGORY_ORDER.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-brand-light mb-1">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={e => setFormData({ ...formData, frequency: e.target.value as TaskFrequency })}
                    className="input-field w-full"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Bi-Annual">Bi-Annual</option>
                    <option value="Annually">Annually</option>
                    <option value="Long-Term">Long-Term</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-brand-light mb-1">Due Date (optional)</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  min={getCurrentDate()}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-brand-light mb-1">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field w-full resize-none"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTask ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
