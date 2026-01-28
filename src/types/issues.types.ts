/**
 * Issue Tracking System Types
 *
 * Issues are distinct from Messages (communication) and Projects (major work):
 * - Issues: Track specific problems to resolution (days to weeks)
 * - Messages: Ongoing communication threads
 * - Projects: Major work with phases, BOMs, multiple vendors (weeks to months)
 */

import type { UserRole } from '../contexts/AuthContext';

// ============================================================================
// Status & Enums
// ============================================================================

/**
 * Issue status workflow:
 * open -> triaged -> assigned -> in_progress -> pending_approval -> resolved -> closed
 *                                            \-> escalated (to owner for decision)
 */
export type IssueStatus =
  | 'open'              // Just reported, awaiting PM review
  | 'triaged'           // PM reviewed, priority/category set
  | 'assigned'          // Assigned to responsible party
  | 'in_progress'       // Work has started
  | 'pending_approval'  // Work complete, awaiting verification
  | 'resolved'          // Successfully resolved
  | 'closed'            // Closed (may be resolved, duplicate, won't fix)
  | 'escalated';        // Escalated to owner for decision

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export type IssueCategory =
  | 'maintenance'       // General repairs, fixes
  | 'safety'            // Safety concerns (urgent)
  | 'pest'              // Pest issues
  | 'noise'             // Noise complaints
  | 'appliance'         // Appliance problems
  | 'plumbing'          // Plumbing specific
  | 'electrical'        // Electrical specific
  | 'hvac'              // HVAC specific
  | 'exterior'          // Exterior/yard issues
  | 'structural'        // Structural concerns
  | 'lease'             // Lease questions/issues
  | 'billing'           // Payment/billing issues
  | 'other';

export type IssueCloseReason = 'resolved' | 'duplicate' | 'wont_fix' | 'invalid' | 'converted_to_project';

export type AssigneeType = 'pm' | 'vendor' | 'tenant';

export type ImageType = 'before' | 'during' | 'after';

export type CostPayer = 'owner' | 'tenant' | 'insurance' | 'warranty';

// ============================================================================
// Core Interfaces
// ============================================================================

export interface IssueImage {
  id: string;
  url: string;                 // Data URL or file path
  caption?: string;
  type: ImageType;
  uploadedAt: string;          // ISO date
  uploadedBy: string;          // User ID
  uploadedByName: string;
}

export interface IssueActivity {
  id: string;
  issueId: string;
  type:
    | 'created'
    | 'status_change'
    | 'priority_change'
    | 'assigned'
    | 'reassigned'
    | 'comment'
    | 'image_added'
    | 'scheduled'
    | 'escalated'
    | 'resolved'
    | 'closed'
    | 'reopened'
    | 'converted_to_project';
  description: string;
  performedBy: string;         // User ID
  performedByName: string;
  performedByRole: UserRole;
  performedAt: string;         // ISO date
  metadata?: {
    previousValue?: string;
    newValue?: string;
    projectId?: string;        // If converted to project
    [key: string]: unknown;
  };
}

export interface Issue {
  id: string;

  // Basic Info
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location?: string;           // Area of property (Kitchen, Bedroom 1, etc.)

  // Reporting
  reportedBy: string;          // User ID
  reportedByName: string;
  reportedByRole: UserRole;
  reportedAt: string;          // ISO date

  // Assignment
  assignedTo?: string;         // User ID or Vendor ID
  assignedToName?: string;
  assignedToType?: AssigneeType;
  assignedAt?: string;
  assignedBy?: string;
  assignedByName?: string;
  scheduledDate?: string;      // When work is scheduled
  scheduledTimeSlot?: string;  // e.g., "2:00 PM - 4:00 PM"

  // Resolution
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolutionNotes?: string;
  closedAt?: string;
  closedBy?: string;
  closeReason?: IssueCloseReason;

  // Media
  images: IssueImage[];

  // Cost Tracking
  estimatedCost?: number;
  actualCost?: number;
  costPaidBy?: CostPayer;
  costNotes?: string;

  // Linking
  linkedVendorId?: string;
  linkedProjectId?: string;    // If converted to project

  // Activity Log
  activities: IssueActivity[];

  // SLA Tracking
  slaTargetHours?: number;     // Based on priority
  slaBreach?: boolean;         // True if SLA was breached
  slaBreachAt?: string;        // When SLA was breached

  // Metadata
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

// ============================================================================
// Configuration & Constants
// ============================================================================

/**
 * SLA targets in hours based on priority
 */
export const SLA_TARGETS: Record<IssuePriority, number> = {
  urgent: 4,    // 4 hours - emergencies
  high: 24,     // 24 hours - significant issues
  medium: 72,   // 3 days - standard issues
  low: 168      // 7 days - minor issues
};

/**
 * Status display configuration
 */
export const ISSUE_STATUS_CONFIG: Record<IssueStatus, {
  label: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  open: {
    label: 'Open',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    description: 'Issue reported, awaiting review'
  },
  triaged: {
    label: 'Triaged',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    description: 'Reviewed and prioritized'
  },
  assigned: {
    label: 'Assigned',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    description: 'Assigned to responsible party'
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    description: 'Work has started'
  },
  pending_approval: {
    label: 'Pending Approval',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    description: 'Work complete, awaiting verification'
  },
  resolved: {
    label: 'Resolved',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'Issue successfully resolved'
  },
  closed: {
    label: 'Closed',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    description: 'Issue closed'
  },
  escalated: {
    label: 'Escalated',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    description: 'Escalated to owner for decision'
  }
};

/**
 * Priority display configuration
 */
export const ISSUE_PRIORITY_CONFIG: Record<IssuePriority, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}> = {
  urgent: {
    label: 'Urgent',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: '🔴',
    description: 'Emergency - affects habitability/safety'
  },
  high: {
    label: 'High',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: '🟠',
    description: 'Significant issue - needs prompt attention'
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: '🟡',
    description: 'Standard issue - normal priority'
  },
  low: {
    label: 'Low',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '🟢',
    description: 'Minor issue - can wait'
  }
};

/**
 * Category display configuration
 */
export const ISSUE_CATEGORY_CONFIG: Record<IssueCategory, {
  label: string;
  icon: string;
  description: string;
}> = {
  maintenance: { label: 'Maintenance', icon: '🔧', description: 'General repairs and fixes' },
  safety: { label: 'Safety', icon: '⚠️', description: 'Safety concerns' },
  pest: { label: 'Pest Control', icon: '🐛', description: 'Pest issues' },
  noise: { label: 'Noise', icon: '🔊', description: 'Noise complaints' },
  appliance: { label: 'Appliance', icon: '🔌', description: 'Appliance problems' },
  plumbing: { label: 'Plumbing', icon: '🚿', description: 'Plumbing issues' },
  electrical: { label: 'Electrical', icon: '💡', description: 'Electrical problems' },
  hvac: { label: 'HVAC', icon: '❄️', description: 'Heating/cooling issues' },
  exterior: { label: 'Exterior', icon: '🏡', description: 'Exterior/yard issues' },
  structural: { label: 'Structural', icon: '🏗️', description: 'Structural concerns' },
  lease: { label: 'Lease', icon: '📋', description: 'Lease questions' },
  billing: { label: 'Billing', icon: '💰', description: 'Payment/billing issues' },
  other: { label: 'Other', icon: '📝', description: 'Other issues' }
};

/**
 * Property locations for issue reporting
 */
export const PROPERTY_LOCATIONS = [
  'Kitchen',
  'Living Room',
  'Dining Room',
  'Master Bedroom',
  'Bedroom 2',
  'Bedroom 3',
  'Master Bathroom',
  'Bathroom 2',
  'Bathroom 3',
  'Laundry Room',
  'Garage',
  'Basement',
  'Attic',
  'Front Yard',
  'Back Yard',
  'Driveway',
  'Patio/Deck',
  'Hallway',
  'Stairs',
  'Exterior - Front',
  'Exterior - Back',
  'Exterior - Side',
  'Roof',
  'HVAC System',
  'Water Heater',
  'Electrical Panel',
  'Other'
] as const;

export type PropertyLocation = typeof PROPERTY_LOCATIONS[number];

// ============================================================================
// Helper Types
// ============================================================================

export interface IssueFilters {
  status?: IssueStatus[];
  priority?: IssuePriority[];
  category?: IssueCategory[];
  assignedTo?: string;
  reportedBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
  showClosed?: boolean;
}

export interface IssueStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  averageResolutionHours: number;
  slaBreachCount: number;
  byCategory: Record<IssueCategory, number>;
  byPriority: Record<IssuePriority, number>;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  location?: string;
  images?: Omit<IssueImage, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploadedByName'>[];
  tags?: string[];
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  category?: IssueCategory;
  priority?: IssuePriority;
  status?: IssueStatus;
  location?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedToType?: AssigneeType;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  estimatedCost?: number;
  actualCost?: number;
  costPaidBy?: CostPayer;
  costNotes?: string;
  resolutionNotes?: string;
  closeReason?: IssueCloseReason;
  tags?: string[];
}

/**
 * Valid status transitions
 */
export const VALID_STATUS_TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  open: ['triaged', 'assigned', 'closed', 'escalated'],
  triaged: ['assigned', 'closed', 'escalated'],
  assigned: ['in_progress', 'triaged', 'closed', 'escalated'],
  in_progress: ['pending_approval', 'assigned', 'escalated'],
  pending_approval: ['resolved', 'in_progress'],
  resolved: ['closed', 'in_progress'],  // Can reopen if needed
  closed: ['open'],  // Can reopen
  escalated: ['assigned', 'closed']
};
