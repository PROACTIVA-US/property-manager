/**
 * Maintenance task data types and localStorage helpers
 * Will be migrated to Firebase later
 */

export type TaskCategory =
  | 'Monthly Routine'
  | 'Quarterly Routine'
  | 'Bi-Annual/Seasonal'
  | 'Annual Routine'
  | 'Major Project Planning';

export type TaskFrequency =
  | 'Monthly'
  | 'Quarterly'
  | 'Bi-Annual'
  | 'Annually'
  | 'Long-Term';

export type TaskStatus = 'pending' | 'completed' | 'overdue';

export interface MaintenanceTask {
  id: string;
  category: TaskCategory;
  frequency: TaskFrequency;
  description: string;
  completed: boolean;
  completedAt?: string; // ISO date string
  dueDate?: string; // ISO date string (YYYY-MM-DD)
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface MaintenanceState {
  tasks: MaintenanceTask[];
  lastUpdated: string;
}

const STORAGE_KEY = 'propertyManager_maintenanceTasks';

/**
 * Generate a unique ID for new tasks
 */
export function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get the current date in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get the current ISO timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Calculate days until due date (negative = overdue)
 */
export function getDaysUntilDue(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determine task status based on completion and due date
 */
export function getTaskStatus(task: MaintenanceTask): TaskStatus {
  if (task.completed) return 'completed';
  if (task.dueDate) {
    const daysUntil = getDaysUntilDue(task.dueDate);
    if (daysUntil < 0) return 'overdue';
  }
  return 'pending';
}

/**
 * Check if a task is upcoming (due within 7 days)
 */
export function isTaskUpcoming(task: MaintenanceTask): boolean {
  if (task.completed || !task.dueDate) return false;
  const daysUntil = getDaysUntilDue(task.dueDate);
  return daysUntil >= 0 && daysUntil <= 7;
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(task: MaintenanceTask): boolean {
  if (task.completed || !task.dueDate) return false;
  return getDaysUntilDue(task.dueDate) < 0;
}

/**
 * Get the number of days in one period for a given frequency
 */
function getFrequencyDays(frequency: TaskFrequency): number | null {
  switch (frequency) {
    case 'Monthly': return 30;
    case 'Quarterly': return 90;
    case 'Bi-Annual': return 180;
    case 'Annually': return 365;
    case 'Long-Term': return null; // Don't auto-recur
  }
}

/**
 * Calculate the next due date based on frequency from a reference date
 */
function getNextDueDate(fromDate: string, frequency: TaskFrequency): string {
  const date = new Date(fromDate);
  switch (frequency) {
    case 'Monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'Quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'Bi-Annual':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'Annually':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      return fromDate;
  }
  return date.toISOString().split('T')[0];
}

/**
 * Auto-reset completed recurring tasks whose period has elapsed.
 * Returns updated tasks array (saves if any changes were made).
 */
export function autoResetRecurringTasks(tasks: MaintenanceTask[]): MaintenanceTask[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let changed = false;

  const updated = tasks.map(task => {
    // Skip non-completed, Long-Term, or tasks without completion date
    if (!task.completed || !task.completedAt || task.frequency === 'Long-Term') {
      return task;
    }

    const periodDays = getFrequencyDays(task.frequency);
    if (periodDays === null) return task;

    const completedDate = new Date(task.completedAt);
    completedDate.setHours(0, 0, 0, 0);
    const daysSinceCompletion = Math.floor((now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceCompletion >= periodDays) {
      changed = true;
      const referenceDate = task.dueDate || task.completedAt.split('T')[0];
      return {
        ...task,
        completed: false,
        completedAt: undefined,
        dueDate: getNextDueDate(referenceDate, task.frequency),
        updatedAt: getCurrentTimestamp(),
      };
    }

    return task;
  });

  if (changed) {
    saveTasks(updated);
  }

  return updated;
}

/**
 * Load tasks from localStorage
 */
export function loadTasks(): MaintenanceTask[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state: MaintenanceState = JSON.parse(stored);
      return autoResetRecurringTasks(state.tasks);
    }
  } catch (error) {
    console.error('Failed to load maintenance tasks:', error);
  }
  return getDefaultTasks();
}

/**
 * Save tasks to localStorage
 */
export function saveTasks(tasks: MaintenanceTask[]): void {
  try {
    const state: MaintenanceState = {
      tasks,
      lastUpdated: getCurrentTimestamp(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save maintenance tasks:', error);
  }
}

/**
 * Add a new task
 */
export function addTask(
  tasks: MaintenanceTask[],
  taskData: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt' | 'completed'>
): MaintenanceTask[] {
  const now = getCurrentTimestamp();
  const newTask: MaintenanceTask = {
    ...taskData,
    id: generateTaskId(),
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
  const updatedTasks = [...tasks, newTask];
  saveTasks(updatedTasks);
  return updatedTasks;
}

/**
 * Update an existing task
 */
export function updateTask(
  tasks: MaintenanceTask[],
  taskId: string,
  updates: Partial<Omit<MaintenanceTask, 'id' | 'createdAt'>>
): MaintenanceTask[] {
  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      return {
        ...task,
        ...updates,
        updatedAt: getCurrentTimestamp(),
      };
    }
    return task;
  });
  saveTasks(updatedTasks);
  return updatedTasks;
}

/**
 * Delete a task
 */
export function deleteTask(tasks: MaintenanceTask[], taskId: string): MaintenanceTask[] {
  const updatedTasks = tasks.filter(task => task.id !== taskId);
  saveTasks(updatedTasks);
  return updatedTasks;
}

/**
 * Toggle task completion status.
 * When completing a recurring task, sets the next due date based on frequency.
 */
export function toggleTaskCompletion(tasks: MaintenanceTask[], taskId: string): MaintenanceTask[] {
  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      const completed = !task.completed;
      const now = getCurrentTimestamp();

      if (completed && task.frequency !== 'Long-Term') {
        // Set next due date when completing a recurring task
        const referenceDate = task.dueDate || getCurrentDate();
        return {
          ...task,
          completed,
          completedAt: now,
          dueDate: getNextDueDate(referenceDate, task.frequency),
          updatedAt: now,
        };
      }

      return {
        ...task,
        completed,
        completedAt: completed ? now : undefined,
        updatedAt: now,
      };
    }
    return task;
  });
  saveTasks(updatedTasks);
  return updatedTasks;
}

/**
 * Complete all tasks in a category
 */
export function completeAllInCategory(
  tasks: MaintenanceTask[],
  category: TaskCategory
): MaintenanceTask[] {
  const now = getCurrentTimestamp();
  const updatedTasks = tasks.map(task => {
    if (task.category === category && !task.completed) {
      return {
        ...task,
        completed: true,
        completedAt: now,
        updatedAt: now,
      };
    }
    return task;
  });
  saveTasks(updatedTasks);
  return updatedTasks;
}

/**
 * Reset all tasks in a category to pending
 */
export function resetCategoryTasks(
  tasks: MaintenanceTask[],
  category: TaskCategory
): MaintenanceTask[] {
  const now = getCurrentTimestamp();
  const updatedTasks = tasks.map(task => {
    if (task.category === category && task.completed) {
      return {
        ...task,
        completed: false,
        completedAt: undefined,
        updatedAt: now,
      };
    }
    return task;
  });
  saveTasks(updatedTasks);
  return updatedTasks;
}

/**
 * Get task statistics
 */
export function getTaskStats(tasks: MaintenanceTask[]) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const overdue = tasks.filter(t => isTaskOverdue(t)).length;
  const upcoming = tasks.filter(t => isTaskUpcoming(t)).length;

  return {
    total,
    completed,
    pending: total - completed,
    overdue,
    upcoming,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/**
 * Get stats by category
 */
export function getCategoryStats(tasks: MaintenanceTask[], category: TaskCategory) {
  const categoryTasks = tasks.filter(t => t.category === category);
  return getTaskStats(categoryTasks);
}

/**
 * Default tasks based on PRD requirements
 */
export function getDefaultTasks(): MaintenanceTask[] {
  const now = getCurrentTimestamp();
  const currentYear = new Date().getFullYear();

  return [
    // Monthly Routine Tasks
    {
      id: 'default_m1',
      category: 'Monthly Routine',
      frequency: 'Monthly',
      description: 'Test all smoke/CO detectors',
      completed: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_m2',
      category: 'Monthly Routine',
      frequency: 'Monthly',
      description: 'Check for leaks/moisture in bathrooms and kitchen',
      completed: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_m3',
      category: 'Monthly Routine',
      frequency: 'Monthly',
      description: 'Clean range hood filter',
      completed: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_m4',
      category: 'Monthly Routine',
      frequency: 'Monthly',
      description: 'Check water softener salt level',
      completed: false,
      createdAt: now,
      updatedAt: now,
    },

    // Quarterly Routine Tasks
    {
      id: 'default_q1',
      category: 'Quarterly Routine',
      frequency: 'Quarterly',
      description: 'Check and/or change HVAC filters',
      completed: false,
      dueDate: `${currentYear}-04-01`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_q2',
      category: 'Quarterly Routine',
      frequency: 'Quarterly',
      description: 'Test garage door auto-reverse safety feature',
      completed: false,
      dueDate: `${currentYear}-04-01`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_q3',
      category: 'Quarterly Routine',
      frequency: 'Quarterly',
      description: 'Inspect caulking around tubs and showers',
      completed: false,
      dueDate: `${currentYear}-04-01`,
      createdAt: now,
      updatedAt: now,
    },

    // Bi-Annual/Seasonal Tasks
    {
      id: 'default_b1',
      category: 'Bi-Annual/Seasonal',
      frequency: 'Bi-Annual',
      description: 'Winter Prep: Clean gutters and downspouts',
      completed: false,
      dueDate: `${currentYear}-09-15`,
      notes: 'Schedule for late September before leaves fall',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_b2',
      category: 'Bi-Annual/Seasonal',
      frequency: 'Bi-Annual',
      description: 'Winter Prep: Inspect roof for damage',
      completed: false,
      dueDate: `${currentYear}-09-15`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_b3',
      category: 'Bi-Annual/Seasonal',
      frequency: 'Bi-Annual',
      description: 'Winter Prep: Schedule furnace tune-up',
      completed: false,
      dueDate: `${currentYear}-10-01`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_b4',
      category: 'Bi-Annual/Seasonal',
      frequency: 'Bi-Annual',
      description: 'Winter Prep: Winterize outdoor plumbing/spigots',
      completed: false,
      dueDate: `${currentYear}-10-15`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_b5',
      category: 'Bi-Annual/Seasonal',
      frequency: 'Bi-Annual',
      description: 'Winter Prep: Check weatherstripping on doors/windows',
      completed: false,
      dueDate: `${currentYear}-10-01`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_b6',
      category: 'Bi-Annual/Seasonal',
      frequency: 'Bi-Annual',
      description: 'Deep Cleaning: Vacuum refrigerator coils',
      completed: false,
      dueDate: `${currentYear}-12-01`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_b7',
      category: 'Bi-Annual/Seasonal',
      frequency: 'Bi-Annual',
      description: 'Deep Cleaning: Clean dishwasher filter',
      completed: false,
      dueDate: `${currentYear}-12-01`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_b8',
      category: 'Bi-Annual/Seasonal',
      frequency: 'Bi-Annual',
      description: 'Deep Cleaning: Descale shower heads',
      completed: false,
      dueDate: `${currentYear}-12-01`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_b9',
      category: 'Bi-Annual/Seasonal',
      frequency: 'Bi-Annual',
      description: 'Deep Cleaning: Check for dampness/leaks in basement',
      completed: false,
      dueDate: `${currentYear}-01-15`,
      createdAt: now,
      updatedAt: now,
    },

    // Annual Routine Tasks
    {
      id: 'default_a1',
      category: 'Annual Routine',
      frequency: 'Annually',
      description: 'January: Flush water heater',
      completed: false,
      dueDate: `${currentYear}-01-31`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_a2',
      category: 'Annual Routine',
      frequency: 'Annually',
      description: 'January: Verify exterminator inspection scheduled',
      completed: false,
      dueDate: `${currentYear}-01-31`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_a3',
      category: 'Annual Routine',
      frequency: 'Annually',
      description: 'January: Check fire extinguisher gauge',
      completed: false,
      dueDate: `${currentYear}-01-31`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_a4',
      category: 'Annual Routine',
      frequency: 'Annually',
      description: 'June: Vacuum dryer vent from exterior',
      completed: false,
      dueDate: `${currentYear}-06-30`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_a5',
      category: 'Annual Routine',
      frequency: 'Annually',
      description: 'June: Inspect/re-seal wood decks (as needed)',
      completed: false,
      dueDate: `${currentYear}-06-30`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_a6',
      category: 'Annual Routine',
      frequency: 'Annually',
      description: 'June: Check foundation perimeter for cracks',
      completed: false,
      dueDate: `${currentYear}-06-30`,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_a7',
      category: 'Annual Routine',
      frequency: 'Annually',
      description: 'June: Trim trees/shrubs away from structure',
      completed: false,
      dueDate: `${currentYear}-06-30`,
      createdAt: now,
      updatedAt: now,
    },

    // Major Project Planning
    {
      id: 'default_p1',
      category: 'Major Project Planning',
      frequency: 'Long-Term',
      description: 'New Roof: Research and obtain quotes',
      completed: false,
      notes: 'Check roof age and condition annually',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_p2',
      category: 'Major Project Planning',
      frequency: 'Long-Term',
      description: 'Exterior Paint Job: Plan seasonal window',
      completed: false,
      notes: 'Best done in late spring or early fall',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'default_p3',
      category: 'Major Project Planning',
      frequency: 'Long-Term',
      description: 'Driveway Sealing: Schedule every 2-3 years',
      completed: false,
      notes: 'Last sealed: check records',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/**
 * Category display order
 */
export const CATEGORY_ORDER: TaskCategory[] = [
  'Monthly Routine',
  'Quarterly Routine',
  'Bi-Annual/Seasonal',
  'Annual Routine',
  'Major Project Planning',
];

/**
 * Category descriptions for display
 */
export const CATEGORY_INFO: Record<TaskCategory, { description: string; timing: string }> = {
  'Monthly Routine': {
    description: 'Regular checks to maintain property safety and condition',
    timing: 'Complete monthly',
  },
  'Quarterly Routine': {
    description: 'Seasonal maintenance tasks',
    timing: 'Jan, Apr, Jul, Oct',
  },
  'Bi-Annual/Seasonal': {
    description: 'Winter prep and deep cleaning tasks',
    timing: 'Spring & Fall',
  },
  'Annual Routine': {
    description: 'Yearly maintenance and inspections',
    timing: 'January & June',
  },
  'Major Project Planning': {
    description: 'Long-term property improvements',
    timing: 'As needed',
  },
};
