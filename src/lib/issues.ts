/**
 * Issues Library - CRUD operations for Issue Tracking System
 * Uses localStorage for persistence
 */

import type {
  Issue,
  IssueStatus,
  IssuePriority,
  IssueCategory,
  IssueActivity,
  IssueImage,
  IssueFilters,
  IssueStats,
  CreateIssueInput,
  UpdateIssueInput,
} from '../types/issues.types';
import { SLA_TARGETS as SLA_TARGET_VALUES } from '../types/issues.types';

// ============================================================================
// Storage
// ============================================================================

const STORAGE_KEY = 'propertyMgr_issues';

function generateId(): string {
  return `issue_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateActivityId(): string {
  return `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// Core CRUD Operations
// ============================================================================

/**
 * Get all issues from storage
 */
export function getIssues(): Issue[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Issue[];
    }
  } catch (error) {
    console.error('Failed to load issues:', error);
  }
  return [];
}

/**
 * Save all issues to storage
 */
function saveIssues(issues: Issue[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  } catch (error) {
    console.error('Failed to save issues:', error);
    throw error;
  }
}

/**
 * Get a single issue by ID
 */
export function getIssueById(id: string): Issue | undefined {
  const issues = getIssues();
  return issues.find(issue => issue.id === id);
}

/**
 * Get issues reported by a specific user
 */
export function getIssuesByReporter(userId: string): Issue[] {
  const issues = getIssues();
  return issues.filter(issue => issue.reportedBy === userId);
}

/**
 * Get issues by status
 */
export function getIssuesByStatus(status: IssueStatus): Issue[] {
  const issues = getIssues();
  return issues.filter(issue => issue.status === status);
}

/**
 * Get issues assigned to a specific user/vendor
 */
export function getIssuesByAssignee(assigneeId: string): Issue[] {
  const issues = getIssues();
  return issues.filter(issue => issue.assignedTo === assigneeId);
}

/**
 * Create a new issue
 */
export function createIssue(
  data: CreateIssueInput,
  reporterId: string,
  reporterName: string,
  reporterRole: 'owner' | 'pm' | 'tenant'
): Issue {
  const now = new Date().toISOString();
  const id = generateId();

  const slaTargetHours = SLA_TARGET_VALUES[data.priority];

  const issue: Issue = {
    id,
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority,
    status: 'open',
    location: data.location,

    reportedBy: reporterId,
    reportedByName: reporterName,
    reportedByRole: reporterRole,
    reportedAt: now,

    images: (data.images || []).map(img => ({
      ...img,
      id: generateImageId(),
      uploadedAt: now,
      uploadedBy: reporterId,
      uploadedByName: reporterName,
    })),

    activities: [{
      id: generateActivityId(),
      issueId: id,
      type: 'created',
      description: `Issue created by ${reporterName}`,
      performedBy: reporterId,
      performedByName: reporterName,
      performedByRole: reporterRole,
      performedAt: now,
    }],

    slaTargetHours,
    slaBreach: false,

    tags: data.tags || [],
    createdAt: now,
    updatedAt: now,
  };

  const issues = getIssues();
  issues.unshift(issue); // Add to beginning for recent first
  saveIssues(issues);

  return issue;
}

/**
 * Update an existing issue
 */
export function updateIssue(
  id: string,
  data: UpdateIssueInput,
  updaterId: string,
  updaterName: string,
  updaterRole: 'owner' | 'pm' | 'tenant'
): Issue {
  const issues = getIssues();
  const index = issues.findIndex(issue => issue.id === id);

  if (index === -1) {
    throw new Error(`Issue not found: ${id}`);
  }

  const now = new Date().toISOString();
  const currentIssue = issues[index];
  const activities: IssueActivity[] = [...currentIssue.activities];

  // Track status changes
  if (data.status && data.status !== currentIssue.status) {
    activities.push({
      id: generateActivityId(),
      issueId: id,
      type: 'status_change',
      description: `Status changed from ${currentIssue.status} to ${data.status}`,
      performedBy: updaterId,
      performedByName: updaterName,
      performedByRole: updaterRole,
      performedAt: now,
      metadata: {
        previousValue: currentIssue.status,
        newValue: data.status,
      },
    });
  }

  // Track priority changes
  if (data.priority && data.priority !== currentIssue.priority) {
    activities.push({
      id: generateActivityId(),
      issueId: id,
      type: 'priority_change',
      description: `Priority changed from ${currentIssue.priority} to ${data.priority}`,
      performedBy: updaterId,
      performedByName: updaterName,
      performedByRole: updaterRole,
      performedAt: now,
      metadata: {
        previousValue: currentIssue.priority,
        newValue: data.priority,
      },
    });
  }

  // Track assignment changes
  if (data.assignedTo && data.assignedTo !== currentIssue.assignedTo) {
    const activityType = currentIssue.assignedTo ? 'reassigned' : 'assigned';
    activities.push({
      id: generateActivityId(),
      issueId: id,
      type: activityType,
      description: currentIssue.assignedTo
        ? `Reassigned from ${currentIssue.assignedToName} to ${data.assignedToName}`
        : `Assigned to ${data.assignedToName}`,
      performedBy: updaterId,
      performedByName: updaterName,
      performedByRole: updaterRole,
      performedAt: now,
      metadata: {
        previousValue: currentIssue.assignedToName,
        newValue: data.assignedToName,
      },
    });
  }

  // Handle resolution
  let resolvedAt = currentIssue.resolvedAt;
  let resolvedBy = currentIssue.resolvedBy;
  let resolvedByName = currentIssue.resolvedByName;

  if (data.status === 'resolved' && currentIssue.status !== 'resolved') {
    resolvedAt = now;
    resolvedBy = updaterId;
    resolvedByName = updaterName;

    activities.push({
      id: generateActivityId(),
      issueId: id,
      type: 'resolved',
      description: `Issue resolved by ${updaterName}`,
      performedBy: updaterId,
      performedByName: updaterName,
      performedByRole: updaterRole,
      performedAt: now,
    });
  }

  // Handle closing
  let closedAt = currentIssue.closedAt;
  let closedBy = currentIssue.closedBy;

  if (data.status === 'closed' && currentIssue.status !== 'closed') {
    closedAt = now;
    closedBy = updaterId;

    activities.push({
      id: generateActivityId(),
      issueId: id,
      type: 'closed',
      description: `Issue closed by ${updaterName}${data.closeReason ? ` (${data.closeReason})` : ''}`,
      performedBy: updaterId,
      performedByName: updaterName,
      performedByRole: updaterRole,
      performedAt: now,
    });
  }

  // Handle escalation
  if (data.status === 'escalated' && currentIssue.status !== 'escalated') {
    activities.push({
      id: generateActivityId(),
      issueId: id,
      type: 'escalated',
      description: `Issue escalated to owner by ${updaterName}`,
      performedBy: updaterId,
      performedByName: updaterName,
      performedByRole: updaterRole,
      performedAt: now,
    });
  }

  // Handle scheduling
  if (data.scheduledDate && data.scheduledDate !== currentIssue.scheduledDate) {
    activities.push({
      id: generateActivityId(),
      issueId: id,
      type: 'scheduled',
      description: `Work scheduled for ${data.scheduledDate}${data.scheduledTimeSlot ? ` at ${data.scheduledTimeSlot}` : ''}`,
      performedBy: updaterId,
      performedByName: updaterName,
      performedByRole: updaterRole,
      performedAt: now,
    });
  }

  const updatedIssue: Issue = {
    ...currentIssue,
    ...data,
    resolvedAt,
    resolvedBy,
    resolvedByName,
    closedAt,
    closedBy,
    activities,
    updatedAt: now,
    // Update SLA target if priority changed
    slaTargetHours: data.priority
      ? SLA_TARGET_VALUES[data.priority]
      : currentIssue.slaTargetHours,
  };

  issues[index] = updatedIssue;
  saveIssues(issues);

  return updatedIssue;
}

/**
 * Delete an issue
 */
export function deleteIssue(id: string): void {
  const issues = getIssues();
  const filtered = issues.filter(issue => issue.id !== id);
  saveIssues(filtered);
}

// ============================================================================
// Activity Management
// ============================================================================

/**
 * Add an activity log entry to an issue
 */
export function addIssueActivity(
  issueId: string,
  activity: Omit<IssueActivity, 'id' | 'issueId'>
): IssueActivity {
  const issues = getIssues();
  const index = issues.findIndex(issue => issue.id === issueId);

  if (index === -1) {
    throw new Error(`Issue not found: ${issueId}`);
  }

  const newActivity: IssueActivity = {
    ...activity,
    id: generateActivityId(),
    issueId,
  };

  issues[index].activities.push(newActivity);
  issues[index].updatedAt = new Date().toISOString();
  saveIssues(issues);

  return newActivity;
}

/**
 * Add a comment to an issue
 */
export function addIssueComment(
  issueId: string,
  comment: string,
  userId: string,
  userName: string,
  userRole: 'owner' | 'pm' | 'tenant'
): IssueActivity {
  return addIssueActivity(issueId, {
    type: 'comment',
    description: comment,
    performedBy: userId,
    performedByName: userName,
    performedByRole: userRole,
    performedAt: new Date().toISOString(),
  });
}

// ============================================================================
// Image Management
// ============================================================================

/**
 * Add an image to an issue
 */
export function addIssueImage(
  issueId: string,
  image: Omit<IssueImage, 'id' | 'uploadedAt'>,
  uploaderId: string,
  uploaderName: string,
  uploaderRole: 'owner' | 'pm' | 'tenant'
): IssueImage {
  const issues = getIssues();
  const index = issues.findIndex(issue => issue.id === issueId);

  if (index === -1) {
    throw new Error(`Issue not found: ${issueId}`);
  }

  const now = new Date().toISOString();
  const newImage: IssueImage = {
    ...image,
    id: generateImageId(),
    uploadedAt: now,
  };

  issues[index].images.push(newImage);
  issues[index].activities.push({
    id: generateActivityId(),
    issueId,
    type: 'image_added',
    description: `${image.type} photo added by ${uploaderName}`,
    performedBy: uploaderId,
    performedByName: uploaderName,
    performedByRole: uploaderRole,
    performedAt: now,
  });
  issues[index].updatedAt = now;

  saveIssues(issues);

  return newImage;
}

/**
 * Remove an image from an issue
 */
export function removeIssueImage(issueId: string, imageId: string): void {
  const issues = getIssues();
  const index = issues.findIndex(issue => issue.id === issueId);

  if (index === -1) {
    throw new Error(`Issue not found: ${issueId}`);
  }

  issues[index].images = issues[index].images.filter(img => img.id !== imageId);
  issues[index].updatedAt = new Date().toISOString();
  saveIssues(issues);
}

// ============================================================================
// SLA Management
// ============================================================================

/**
 * Check if an issue has breached its SLA
 */
export function checkSLABreach(issue: Issue): boolean {
  if (issue.slaBreach) {
    return true; // Already marked as breached
  }

  if (issue.status === 'resolved' || issue.status === 'closed') {
    return issue.slaBreach || false; // Use recorded breach status
  }

  if (!issue.slaTargetHours) {
    return false;
  }

  const reportedAt = new Date(issue.reportedAt).getTime();
  const now = Date.now();
  const hoursElapsed = (now - reportedAt) / (1000 * 60 * 60);

  return hoursElapsed > issue.slaTargetHours;
}

/**
 * Update SLA breach status for all open issues
 */
export function updateSLABreaches(): Issue[] {
  const issues = getIssues();
  let updated = false;

  const now = new Date().toISOString();

  issues.forEach(issue => {
    if (!issue.slaBreach && checkSLABreach(issue)) {
      issue.slaBreach = true;
      issue.slaBreachAt = now;
      issue.updatedAt = now;
      updated = true;
    }
  });

  if (updated) {
    saveIssues(issues);
  }

  return issues;
}

// ============================================================================
// Filtering & Search
// ============================================================================

/**
 * Filter issues based on criteria
 */
export function filterIssues(filters: IssueFilters): Issue[] {
  let issues = getIssues();

  // Filter by status
  if (filters.status && filters.status.length > 0) {
    issues = issues.filter(issue => filters.status!.includes(issue.status));
  } else if (!filters.showClosed) {
    // By default, hide closed issues
    issues = issues.filter(issue => issue.status !== 'closed');
  }

  // Filter by priority
  if (filters.priority && filters.priority.length > 0) {
    issues = issues.filter(issue => filters.priority!.includes(issue.priority));
  }

  // Filter by category
  if (filters.category && filters.category.length > 0) {
    issues = issues.filter(issue => filters.category!.includes(issue.category));
  }

  // Filter by assignee
  if (filters.assignedTo) {
    issues = issues.filter(issue => issue.assignedTo === filters.assignedTo);
  }

  // Filter by reporter
  if (filters.reportedBy) {
    issues = issues.filter(issue => issue.reportedBy === filters.reportedBy);
  }

  // Filter by date range
  if (filters.dateRange) {
    const startDate = new Date(filters.dateRange.start).getTime();
    const endDate = new Date(filters.dateRange.end).getTime();
    issues = issues.filter(issue => {
      const issueDate = new Date(issue.reportedAt).getTime();
      return issueDate >= startDate && issueDate <= endDate;
    });
  }

  // Search by title/description
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    issues = issues.filter(issue =>
      issue.title.toLowerCase().includes(searchLower) ||
      issue.description.toLowerCase().includes(searchLower)
    );
  }

  return issues;
}

// ============================================================================
// Statistics & Metrics
// ============================================================================

/**
 * Get issue metrics and statistics
 */
export function getIssueMetrics(): IssueStats {
  const issues = getIssues();

  const stats: IssueStats = {
    total: issues.length,
    open: 0,
    inProgress: 0,
    resolved: 0,
    averageResolutionHours: 0,
    slaBreachCount: 0,
    byCategory: {} as Record<IssueCategory, number>,
    byPriority: {} as Record<IssuePriority, number>,
  };

  // Initialize category and priority counts
  const categories: IssueCategory[] = [
    'maintenance', 'safety', 'pest', 'noise', 'appliance',
    'plumbing', 'electrical', 'hvac', 'exterior', 'structural',
    'lease', 'billing', 'other'
  ];
  const priorities: IssuePriority[] = ['low', 'medium', 'high', 'urgent'];

  categories.forEach(cat => stats.byCategory[cat] = 0);
  priorities.forEach(pri => stats.byPriority[pri] = 0);

  let totalResolutionHours = 0;
  let resolvedCount = 0;

  issues.forEach(issue => {
    // Status counts
    if (['open', 'triaged'].includes(issue.status)) {
      stats.open++;
    } else if (['assigned', 'in_progress', 'pending_approval'].includes(issue.status)) {
      stats.inProgress++;
    } else if (issue.status === 'resolved' || issue.status === 'closed') {
      stats.resolved++;
    }

    // SLA breaches
    if (issue.slaBreach || checkSLABreach(issue)) {
      stats.slaBreachCount++;
    }

    // Category counts
    stats.byCategory[issue.category] = (stats.byCategory[issue.category] || 0) + 1;

    // Priority counts
    stats.byPriority[issue.priority] = (stats.byPriority[issue.priority] || 0) + 1;

    // Resolution time calculation
    if (issue.resolvedAt) {
      const reportedAt = new Date(issue.reportedAt).getTime();
      const resolvedAt = new Date(issue.resolvedAt).getTime();
      const hoursToResolve = (resolvedAt - reportedAt) / (1000 * 60 * 60);
      totalResolutionHours += hoursToResolve;
      resolvedCount++;
    }
  });

  stats.averageResolutionHours = resolvedCount > 0
    ? Math.round(totalResolutionHours / resolvedCount)
    : 0;

  return stats;
}

/**
 * Get issues grouped by status for Kanban view
 */
export function getIssuesByStatusGroups(): Record<IssueStatus, Issue[]> {
  const issues = getIssues();
  const groups: Record<IssueStatus, Issue[]> = {
    open: [],
    triaged: [],
    assigned: [],
    in_progress: [],
    pending_approval: [],
    resolved: [],
    closed: [],
    escalated: [],
  };

  issues.forEach(issue => {
    groups[issue.status].push(issue);
  });

  return groups;
}

// ============================================================================
// Demo Data
// ============================================================================

/**
 * Generate sample issues for demo purposes
 */
export function generateSampleIssues(): void {
  const existingIssues = getIssues();
  if (existingIssues.length > 0) {
    return; // Don't overwrite existing issues
  }

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const sampleIssues: Issue[] = [
    {
      id: 'issue_sample_1',
      title: 'Kitchen faucet leaking',
      description: 'The kitchen faucet has a slow drip that has been getting worse over the past week.',
      category: 'plumbing',
      priority: 'medium',
      status: 'assigned',
      location: 'Kitchen',
      reportedBy: 'tenant_1',
      reportedByName: 'Gregg Marshall',
      reportedByRole: 'tenant',
      reportedAt: weekAgo.toISOString(),
      assignedTo: 'vendor_plumber_1',
      assignedToName: 'Quick Fix Plumbing',
      assignedToType: 'vendor',
      assignedAt: dayAgo.toISOString(),
      assignedBy: 'pm_1',
      assignedByName: 'Dan Connolly',
      scheduledDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      images: [],
      activities: [
        {
          id: 'act_1',
          issueId: 'issue_sample_1',
          type: 'created',
          description: 'Issue created by Gregg Marshall',
          performedBy: 'tenant_1',
          performedByName: 'Gregg Marshall',
          performedByRole: 'tenant',
          performedAt: weekAgo.toISOString(),
        },
        {
          id: 'act_2',
          issueId: 'issue_sample_1',
          type: 'assigned',
          description: 'Assigned to Quick Fix Plumbing',
          performedBy: 'pm_1',
          performedByName: 'Dan Connolly',
          performedByRole: 'pm',
          performedAt: dayAgo.toISOString(),
        },
      ],
      estimatedCost: 150,
      slaTargetHours: 72,
      slaBreach: false,
      createdAt: weekAgo.toISOString(),
      updatedAt: dayAgo.toISOString(),
    },
    {
      id: 'issue_sample_2',
      title: 'HVAC not cooling properly',
      description: 'AC is running but not cooling the house below 78 degrees even when set to 72.',
      category: 'hvac',
      priority: 'high',
      status: 'open',
      location: 'HVAC System',
      reportedBy: 'tenant_1',
      reportedByName: 'Gregg Marshall',
      reportedByRole: 'tenant',
      reportedAt: dayAgo.toISOString(),
      images: [],
      activities: [
        {
          id: 'act_3',
          issueId: 'issue_sample_2',
          type: 'created',
          description: 'Issue created by Gregg Marshall',
          performedBy: 'tenant_1',
          performedByName: 'Gregg Marshall',
          performedByRole: 'tenant',
          performedAt: dayAgo.toISOString(),
        },
      ],
      slaTargetHours: 24,
      slaBreach: false,
      createdAt: dayAgo.toISOString(),
      updatedAt: dayAgo.toISOString(),
    },
    {
      id: 'issue_sample_3',
      title: 'Garage door opener broken',
      description: 'The garage door opener stopped working. Remote and wall button both not responding.',
      category: 'appliance',
      priority: 'low',
      status: 'resolved',
      location: 'Garage',
      reportedBy: 'tenant_1',
      reportedByName: 'Gregg Marshall',
      reportedByRole: 'tenant',
      reportedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedAt: weekAgo.toISOString(),
      resolvedBy: 'pm_1',
      resolvedByName: 'Dan Connolly',
      resolutionNotes: 'Replaced batteries in remote and reset the opener. Working properly now.',
      images: [],
      activities: [
        {
          id: 'act_4',
          issueId: 'issue_sample_3',
          type: 'created',
          description: 'Issue created by Gregg Marshall',
          performedBy: 'tenant_1',
          performedByName: 'Gregg Marshall',
          performedByRole: 'tenant',
          performedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'act_5',
          issueId: 'issue_sample_3',
          type: 'resolved',
          description: 'Issue resolved by Dan Connolly',
          performedBy: 'pm_1',
          performedByName: 'Dan Connolly',
          performedByRole: 'pm',
          performedAt: weekAgo.toISOString(),
        },
      ],
      actualCost: 25,
      costPaidBy: 'owner',
      slaTargetHours: 168,
      slaBreach: false,
      createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: weekAgo.toISOString(),
    },
  ];

  saveIssues(sampleIssues);
}

// ============================================================================
// Escalation Management
// ============================================================================

/**
 * Get all escalated issues
 */
export function getEscalatedIssues(): Issue[] {
  const issues = getIssues();
  return issues.filter(issue => issue.status === 'escalated');
}

/**
 * Get pending escalations awaiting owner decision
 */
export function getPendingEscalations(): Issue[] {
  const issues = getIssues();
  return issues.filter(
    issue => issue.status === 'escalated' &&
      (!issue.ownerApprovalStatus || issue.ownerApprovalStatus === 'pending')
  );
}

/**
 * Escalate an issue to the owner for decision
 */
export function escalateIssue(
  issueId: string,
  reason: string,
  escalatedBy: string,
  escalatedByName: string,
  escalatedByRole: 'owner' | 'pm' | 'tenant'
): Issue {
  const issues = getIssues();
  const index = issues.findIndex(issue => issue.id === issueId);
  if (index === -1) throw new Error(`Issue not found: ${issueId}`);

  const now = new Date().toISOString();
  const currentIssue = issues[index];
  const activities = [...currentIssue.activities];

  activities.push({
    id: generateActivityId(),
    issueId,
    type: 'escalated',
    description: `Issue escalated to owner: "${reason}"`,
    performedBy: escalatedBy,
    performedByName: escalatedByName,
    performedByRole: escalatedByRole,
    performedAt: now,
    metadata: { escalationReason: reason },
  });

  const updatedIssue: Issue = {
    ...currentIssue,
    status: 'escalated',
    escalatedAt: now,
    escalatedBy,
    escalatedByName,
    escalationReason: reason,
    ownerApprovalStatus: 'pending',
    activities,
    updatedAt: now,
  };

  issues[index] = updatedIssue;
  saveIssues(issues);
  return updatedIssue;
}

/**
 * Approve an escalated issue
 */
export function approveEscalation(
  issueId: string,
  ownerDecision: string,
  approverId: string,
  approverName: string
): Issue {
  const issues = getIssues();
  const index = issues.findIndex(issue => issue.id === issueId);
  if (index === -1) throw new Error(`Issue not found: ${issueId}`);

  const now = new Date().toISOString();
  const currentIssue = issues[index];

  const activities = [...currentIssue.activities];
  activities.push({
    id: generateActivityId(),
    issueId,
    type: 'status_change',
    description: `Escalation approved by owner: "${ownerDecision}"`,
    performedBy: approverId,
    performedByName: approverName,
    performedByRole: 'owner',
    performedAt: now,
    metadata: { previousValue: 'escalated', newValue: 'assigned' },
  });

  const updatedIssue: Issue = {
    ...currentIssue,
    status: 'assigned',
    ownerApprovalStatus: 'approved',
    ownerApprovedAt: now,
    ownerDecision,
    activities,
    updatedAt: now,
  };

  issues[index] = updatedIssue;
  saveIssues(issues);
  return updatedIssue;
}

/**
 * Reject an escalated issue
 */
export function rejectEscalation(
  issueId: string,
  ownerDecision: string,
  rejectorId: string,
  rejectorName: string
): Issue {
  const issues = getIssues();
  const index = issues.findIndex(issue => issue.id === issueId);
  if (index === -1) throw new Error(`Issue not found: ${issueId}`);

  const now = new Date().toISOString();
  const currentIssue = issues[index];

  const activities = [...currentIssue.activities];
  activities.push({
    id: generateActivityId(),
    issueId,
    type: 'status_change',
    description: `Escalation rejected by owner: "${ownerDecision}"`,
    performedBy: rejectorId,
    performedByName: rejectorName,
    performedByRole: 'owner',
    performedAt: now,
    metadata: { previousValue: 'escalated', newValue: 'triaged' },
  });

  const updatedIssue: Issue = {
    ...currentIssue,
    status: 'triaged',
    ownerApprovalStatus: 'rejected',
    ownerApprovedAt: now,
    ownerDecision,
    activities,
    updatedAt: now,
  };

  issues[index] = updatedIssue;
  saveIssues(issues);
  return updatedIssue;
}

/**
 * Get count of pending escalations
 */
export function getEscalationCount(): number {
  return getPendingEscalations().length;
}
