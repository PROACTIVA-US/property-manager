/**
 * Project Management System
 * Comprehensive project tracking with Kanban workflow, stakeholder management,
 * messaging, and AI-assisted impact analysis
 */

import type { UserRole } from '../contexts/AuthContext';
import { generateId } from './vendors';

// ============ Types ============

export type ProjectStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ProjectCategory =
  | 'renovation'
  | 'repair'
  | 'upgrade'
  | 'maintenance'
  | 'inspection'
  | 'emergency'
  | 'cosmetic'
  | 'compliance'
  | 'other';

// Kanban stage definitions
export interface KanbanStage {
  id: ProjectStatus;
  label: string;
  color: string;
  description: string;
}

export const KANBAN_STAGES: KanbanStage[] = [
  { id: 'draft', label: 'Draft', color: 'slate', description: 'Initial planning phase' },
  { id: 'pending_approval', label: 'Pending Approval', color: 'yellow', description: 'Awaiting stakeholder approval' },
  { id: 'approved', label: 'Approved', color: 'blue', description: 'Ready to start' },
  { id: 'in_progress', label: 'In Progress', color: 'orange', description: 'Work underway' },
  { id: 'on_hold', label: 'On Hold', color: 'purple', description: 'Temporarily paused' },
  { id: 'completed', label: 'Completed', color: 'green', description: 'Successfully finished' },
  { id: 'cancelled', label: 'Cancelled', color: 'red', description: 'Project cancelled' },
];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const PRIORITY_LABELS: Record<ProjectPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  renovation: 'Renovation',
  repair: 'Repair',
  upgrade: 'Upgrade',
  maintenance: 'Maintenance',
  inspection: 'Inspection',
  emergency: 'Emergency',
  cosmetic: 'Cosmetic',
  compliance: 'Compliance',
  other: 'Other',
};

// Stakeholder in a project
export interface Stakeholder {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  isProjectOwner: boolean;
  notificationPreference: 'all' | 'important' | 'none';
}

// Emergency contact for a project
export interface EmergencyContact {
  name: string;
  phone: string;
  email?: string;
  relationship: string; // e.g., "Vendor Primary", "Property Owner", "PM"
}

// Project image/attachment
export interface ProjectAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  dataUrl: string; // Base64 encoded
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
  category: 'before' | 'during' | 'after' | 'estimate' | 'plan' | 'other';
}

// Message in project message center
export interface ProjectMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  isSystemMessage: boolean;
  attachmentIds?: string[];
  readBy: string[]; // User IDs who have read
}

// AI Impact Analysis
export interface ImpactAnalysis {
  tenantImpact: {
    level: 'none' | 'minimal' | 'moderate' | 'significant';
    description: string;
    recommendations: string[];
    estimatedDuration?: string;
    accessRestrictions?: string[];
  };
  ownerImpact: {
    level: 'none' | 'minimal' | 'moderate' | 'significant';
    description: string;
    financialNotes?: string;
    recommendations: string[];
  };
  suggestedNotifications: {
    recipient: 'tenant' | 'owner' | 'pm' | 'vendor';
    timing: 'immediate' | 'before_start' | 'on_completion';
    message: string;
  }[];
  generatedAt: string;
}

// Project plan phase/milestone
export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  startDate?: string;
  endDate?: string;
  estimatedDays?: number;
  assignedVendorId?: string;
  notes?: string;
}

// Main Project interface
export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  priority: ProjectPriority;

  // Vendor association
  primaryVendorId?: string;
  additionalVendorIds: string[];

  // Project owner (PM by default)
  projectOwnerId: string;
  projectOwnerName: string;

  // Stakeholders
  stakeholders: Stakeholder[];

  // Emergency contacts
  emergencyContacts: EmergencyContact[];

  // Project plan
  phases: ProjectPhase[];

  // Estimates
  estimatedCost?: number;
  actualCost?: number;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;

  // Impact analysis
  impactAnalysis?: ImpactAnalysis;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;

  // Notes and tags
  notes?: string;
  tags: string[];
}

// ============ Storage Keys ============

const PROJECTS_KEY = 'propertyMgr_projects';
const PROJECT_MESSAGES_KEY = 'propertyMgr_projectMessages';
const PROJECT_ATTACHMENTS_KEY = 'propertyMgr_projectAttachments';

// ============ Project CRUD ============

export function getProjects(): Project[] {
  try {
    const stored = localStorage.getItem(PROJECTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading projects:', error);
  }
  return getDefaultProjects();
}

export function getProjectById(id: string): Project | undefined {
  return getProjects().find(p => p.id === id);
}

export function getProjectsByStatus(status: ProjectStatus): Project[] {
  return getProjects().filter(p => p.status === status);
}

export function getProjectsByVendor(vendorId: string): Project[] {
  return getProjects().filter(
    p => p.primaryVendorId === vendorId || p.additionalVendorIds.includes(vendorId)
  );
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects:', error);
  }
}

export function createProject(
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Project {
  const projects = getProjects();
  const now = new Date().toISOString();

  const newProject: Project = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  projects.push(newProject);
  saveProjects(projects);

  // Create system message for project creation
  createProjectMessage({
    projectId: newProject.id,
    senderId: 'system',
    senderName: 'System',
    senderRole: null,
    content: `Project "${newProject.title}" was created.`,
    isSystemMessage: true,
    readBy: [],
  });

  return newProject;
}

export function updateProject(
  id: string,
  updates: Partial<Omit<Project, 'id' | 'createdAt'>>
): Project | null {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);

  if (index === -1) return null;

  const oldStatus = projects[index].status;

  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveProjects(projects);

  // Create system message if status changed
  if (updates.status && updates.status !== oldStatus) {
    createProjectMessage({
      projectId: id,
      senderId: 'system',
      senderName: 'System',
      senderRole: null,
      content: `Project status changed from "${STATUS_LABELS[oldStatus]}" to "${STATUS_LABELS[updates.status]}".`,
      isSystemMessage: true,
      readBy: [],
    });
  }

  return projects[index];
}

export function deleteProject(id: string): boolean {
  const projects = getProjects();
  const filtered = projects.filter(p => p.id !== id);

  if (filtered.length === projects.length) return false;

  saveProjects(filtered);

  // Also delete related messages and attachments
  deleteProjectMessages(id);
  deleteProjectAttachments(id);

  return true;
}

// ============ Project Messages ============

export function getProjectMessages(projectId: string): ProjectMessage[] {
  try {
    const stored = localStorage.getItem(PROJECT_MESSAGES_KEY);
    const all: ProjectMessage[] = stored ? JSON.parse(stored) : [];
    return all.filter(m => m.projectId === projectId).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error reading project messages:', error);
    return [];
  }
}

export function getAllProjectMessages(): ProjectMessage[] {
  try {
    const stored = localStorage.getItem(PROJECT_MESSAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading project messages:', error);
    return [];
  }
}

export function saveProjectMessages(messages: ProjectMessage[]): void {
  try {
    localStorage.setItem(PROJECT_MESSAGES_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving project messages:', error);
  }
}

export function createProjectMessage(
  data: Omit<ProjectMessage, 'id' | 'timestamp'>
): ProjectMessage {
  const messages = getAllProjectMessages();

  const newMessage: ProjectMessage = {
    ...data,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };

  messages.push(newMessage);
  saveProjectMessages(messages);

  return newMessage;
}

export function markMessagesAsRead(projectId: string, userId: string): void {
  const messages = getAllProjectMessages();
  const updated = messages.map(m => {
    if (m.projectId === projectId && !m.readBy.includes(userId)) {
      return { ...m, readBy: [...m.readBy, userId] };
    }
    return m;
  });
  saveProjectMessages(updated);
}

export function getUnreadMessageCount(projectId: string, userId: string): number {
  const messages = getProjectMessages(projectId);
  return messages.filter(m => !m.readBy.includes(userId) && m.senderId !== userId).length;
}

function deleteProjectMessages(projectId: string): void {
  const messages = getAllProjectMessages().filter(m => m.projectId !== projectId);
  saveProjectMessages(messages);
}

// ============ Project Attachments ============

export function getProjectAttachments(projectId: string): ProjectAttachment[] {
  try {
    const stored = localStorage.getItem(PROJECT_ATTACHMENTS_KEY);
    const all: ProjectAttachment[] = stored ? JSON.parse(stored) : [];
    return all.filter(a => a.id.startsWith(projectId));
  } catch (error) {
    console.error('Error reading project attachments:', error);
    return [];
  }
}

export function getAllProjectAttachments(): ProjectAttachment[] {
  try {
    const stored = localStorage.getItem(PROJECT_ATTACHMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading project attachments:', error);
    return [];
  }
}

export function saveProjectAttachments(attachments: ProjectAttachment[]): void {
  try {
    localStorage.setItem(PROJECT_ATTACHMENTS_KEY, JSON.stringify(attachments));
  } catch (error) {
    console.error('Error saving project attachments:', error);
  }
}

export function createProjectAttachment(
  projectId: string,
  file: File,
  uploadedBy: string,
  category: ProjectAttachment['category'],
  description?: string
): Promise<ProjectAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const attachments = getAllProjectAttachments();

      const newAttachment: ProjectAttachment = {
        id: `${projectId}_${generateId()}`,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        dataUrl: reader.result as string,
        uploadedAt: new Date().toISOString(),
        uploadedBy,
        description,
        category,
      };

      attachments.push(newAttachment);
      saveProjectAttachments(attachments);
      resolve(newAttachment);
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function deleteProjectAttachment(attachmentId: string): boolean {
  const attachments = getAllProjectAttachments();
  const filtered = attachments.filter(a => a.id !== attachmentId);

  if (filtered.length === attachments.length) return false;

  saveProjectAttachments(filtered);
  return true;
}

function deleteProjectAttachments(projectId: string): void {
  const attachments = getAllProjectAttachments().filter(
    a => !a.id.startsWith(projectId)
  );
  saveProjectAttachments(attachments);
}

// ============ AI Impact Analysis ============

export function generateImpactAnalysis(project: Project): ImpactAnalysis {
  // This simulates AI analysis - in production, this would call an AI API
  const analysis: ImpactAnalysis = {
    tenantImpact: {
      level: 'none',
      description: '',
      recommendations: [],
    },
    ownerImpact: {
      level: 'none',
      description: '',
      recommendations: [],
    },
    suggestedNotifications: [],
    generatedAt: new Date().toISOString(),
  };

  // Analyze based on category and priority
  switch (project.category) {
    case 'emergency':
      analysis.tenantImpact = {
        level: 'significant',
        description: 'Emergency repair may require immediate access to the property. Tenant should be notified immediately.',
        recommendations: [
          'Notify tenant immediately via phone',
          'Provide estimated repair timeline',
          'Arrange alternative accommodations if needed',
          'Keep tenant updated on progress',
        ],
        estimatedDuration: 'Varies based on emergency type',
        accessRestrictions: ['Area may be temporarily inaccessible'],
      };
      analysis.ownerImpact = {
        level: 'significant',
        description: 'Emergency repairs typically incur higher costs due to urgency.',
        financialNotes: 'Consider insurance coverage for emergency repairs',
        recommendations: [
          'Document all damage for insurance',
          'Approve emergency spending limit',
          'Review contractor emergency rates',
        ],
      };
      analysis.suggestedNotifications = [
        { recipient: 'tenant', timing: 'immediate', message: 'Emergency repair scheduled. Our team will contact you shortly.' },
        { recipient: 'owner', timing: 'immediate', message: 'Emergency repair required at property. Awaiting cost estimate.' },
      ];
      break;

    case 'renovation':
      analysis.tenantImpact = {
        level: 'significant',
        description: 'Renovation work will likely cause noise, dust, and temporary access restrictions.',
        recommendations: [
          'Provide 48-hour advance notice minimum',
          'Share detailed work schedule',
          'Identify quiet hours for tenant convenience',
          'Arrange dust barriers if needed',
        ],
        estimatedDuration: project.phases.length > 0
          ? `${project.phases.reduce((sum, p) => sum + (p.estimatedDays || 0), 0)} days estimated`
          : 'To be determined',
        accessRestrictions: ['Work areas will have restricted access during renovation'],
      };
      analysis.ownerImpact = {
        level: 'moderate',
        description: 'Renovation investment will increase property value but requires upfront capital.',
        financialNotes: 'Track all expenses for tax purposes and ROI calculation',
        recommendations: [
          'Get multiple contractor bids',
          'Establish payment milestones',
          'Document before/after for value assessment',
        ],
      };
      analysis.suggestedNotifications = [
        { recipient: 'tenant', timing: 'before_start', message: 'Renovation project begins [DATE]. Please review the attached schedule.' },
        { recipient: 'owner', timing: 'before_start', message: 'Renovation approved and scheduled. Work begins [DATE].' },
        { recipient: 'tenant', timing: 'on_completion', message: 'Renovation complete. Thank you for your patience.' },
      ];
      break;

    case 'repair':
      analysis.tenantImpact = {
        level: 'moderate',
        description: 'Repair work will require temporary access to the property.',
        recommendations: [
          'Schedule during tenant-preferred hours',
          'Provide 24-hour advance notice',
          'Minimize disruption to daily routines',
        ],
        estimatedDuration: '1-3 days typical',
      };
      analysis.ownerImpact = {
        level: 'minimal',
        description: 'Standard repair costs as part of property maintenance.',
        recommendations: [
          'Review warranty coverage',
          'Compare repair vs replacement costs',
        ],
      };
      analysis.suggestedNotifications = [
        { recipient: 'tenant', timing: 'before_start', message: 'Repair scheduled for [DATE]. A technician will arrive between [TIME RANGE].' },
      ];
      break;

    case 'inspection':
      analysis.tenantImpact = {
        level: 'minimal',
        description: 'Brief property inspection requiring tenant coordination.',
        recommendations: [
          'Provide 48-hour notice as required by law',
          'Offer multiple time slot options',
          'Keep inspection duration under 1 hour',
        ],
        estimatedDuration: '30-60 minutes',
      };
      analysis.ownerImpact = {
        level: 'none',
        description: 'Routine inspection with no immediate financial impact.',
        recommendations: [
          'Review inspection report promptly',
          'Address any findings within 30 days',
        ],
      };
      analysis.suggestedNotifications = [
        { recipient: 'tenant', timing: 'before_start', message: 'Property inspection scheduled for [DATE] at [TIME]. Please ensure access is available.' },
      ];
      break;

    case 'maintenance':
      analysis.tenantImpact = {
        level: 'minimal',
        description: 'Routine maintenance work with minimal disruption.',
        recommendations: [
          'Schedule during normal business hours',
          'Notify tenant 24 hours in advance',
        ],
        estimatedDuration: '1-4 hours typical',
      };
      analysis.ownerImpact = {
        level: 'none',
        description: 'Expected maintenance costs covered in operating budget.',
        recommendations: [
          'Track maintenance costs for annual review',
        ],
      };
      break;

    default:
      analysis.tenantImpact = {
        level: 'minimal',
        description: 'Project may require property access. Specific impact to be determined.',
        recommendations: [
          'Assess impact once scope is finalized',
          'Communicate timeline to tenant',
        ],
      };
      analysis.ownerImpact = {
        level: 'minimal',
        description: 'Financial impact to be determined based on final scope.',
        recommendations: [
          'Review project estimates before approval',
        ],
      };
  }

  // Adjust based on priority
  if (project.priority === 'urgent' || project.priority === 'high') {
    analysis.suggestedNotifications.unshift({
      recipient: 'pm',
      timing: 'immediate',
      message: `High priority project "${project.title}" requires immediate attention.`,
    });
  }

  return analysis;
}

// ============ Statistics ============

export function getProjectStats() {
  const projects = getProjects();

  const byStatus: Record<ProjectStatus, number> = {
    draft: 0,
    pending_approval: 0,
    approved: 0,
    in_progress: 0,
    on_hold: 0,
    completed: 0,
    cancelled: 0,
  };

  const byCategory: Record<ProjectCategory, number> = {
    renovation: 0,
    repair: 0,
    upgrade: 0,
    maintenance: 0,
    inspection: 0,
    emergency: 0,
    cosmetic: 0,
    compliance: 0,
    other: 0,
  };

  let totalEstimatedCost = 0;
  let totalActualCost = 0;

  projects.forEach(p => {
    byStatus[p.status]++;
    byCategory[p.category]++;
    if (p.estimatedCost) totalEstimatedCost += p.estimatedCost;
    if (p.actualCost) totalActualCost += p.actualCost;
  });

  const activeCount = byStatus.in_progress + byStatus.approved + byStatus.pending_approval;

  return {
    total: projects.length,
    byStatus,
    byCategory,
    activeCount,
    completedCount: byStatus.completed,
    totalEstimatedCost,
    totalActualCost,
  };
}

// ============ Default Data ============

function getDefaultProjects(): Project[] {
  const now = new Date().toISOString();

  return [
    {
      id: 'project-1',
      title: 'HVAC System Upgrade',
      description: 'Replace aging HVAC unit with a more efficient model. Includes ductwork inspection and cleaning.',
      category: 'upgrade',
      status: 'in_progress',
      priority: 'high',
      primaryVendorId: 'vendor-4', // Cool Air HVAC
      additionalVendorIds: [],
      projectOwnerId: 'pm-1',
      projectOwnerName: 'Dan Connolly',
      stakeholders: [
        {
          id: 'pm-1',
          name: 'Dan Connolly',
          role: 'pm',
          email: 'dan@propertymanager.com',
          phone: '(555) 100-0001',
          isProjectOwner: true,
          notificationPreference: 'all',
        },
        {
          id: 'owner-1',
          name: 'Shanie Holman',
          role: 'owner',
          email: 'shanie@email.com',
          phone: '(555) 100-0002',
          isProjectOwner: false,
          notificationPreference: 'important',
        },
        {
          id: 'tenant-1',
          name: 'Gregg Marshall',
          role: 'tenant',
          email: 'gregg@email.com',
          phone: '(555) 100-0003',
          isProjectOwner: false,
          notificationPreference: 'all',
        },
      ],
      emergencyContacts: [
        {
          name: 'Cool Air HVAC Emergency',
          phone: '(555) 456-7890',
          email: 'emergency@coolairhvac.com',
          relationship: 'Vendor Primary',
        },
        {
          name: 'Dan Connolly',
          phone: '(555) 100-0001',
          relationship: 'Property Manager',
        },
      ],
      phases: [
        {
          id: 'phase-1',
          name: 'Site Assessment',
          description: 'Initial inspection and measurements',
          order: 1,
          status: 'completed',
          estimatedDays: 1,
        },
        {
          id: 'phase-2',
          name: 'Equipment Procurement',
          description: 'Order and receive new HVAC unit',
          order: 2,
          status: 'completed',
          estimatedDays: 5,
        },
        {
          id: 'phase-3',
          name: 'Old Unit Removal',
          description: 'Safely remove and dispose of old HVAC',
          order: 3,
          status: 'in_progress',
          estimatedDays: 1,
        },
        {
          id: 'phase-4',
          name: 'New Unit Installation',
          description: 'Install and connect new HVAC system',
          order: 4,
          status: 'pending',
          estimatedDays: 2,
        },
        {
          id: 'phase-5',
          name: 'Testing & Commissioning',
          description: 'Test all functions and optimize settings',
          order: 5,
          status: 'pending',
          estimatedDays: 1,
        },
      ],
      estimatedCost: 8500,
      estimatedStartDate: '2026-01-20',
      estimatedEndDate: '2026-01-30',
      actualStartDate: '2026-01-20',
      impactAnalysis: {
        tenantImpact: {
          level: 'moderate',
          description: 'HVAC replacement will require access to mechanical areas. Temporary heating/cooling disruption expected.',
          recommendations: [
            'Provide portable heating/cooling units during installation',
            'Schedule work during mild weather if possible',
            'Notify tenant 48 hours before each phase',
          ],
          estimatedDuration: '3-4 days of active work',
          accessRestrictions: ['Utility room access required'],
        },
        ownerImpact: {
          level: 'moderate',
          description: 'Significant capital investment with long-term energy savings.',
          financialNotes: 'New unit qualifies for energy efficiency tax credit',
          recommendations: [
            'Keep all receipts for tax purposes',
            'Register warranty within 30 days',
            'Schedule annual maintenance contract',
          ],
        },
        suggestedNotifications: [
          { recipient: 'tenant', timing: 'before_start', message: 'HVAC upgrade begins Monday. Expect 3-4 days of installation.' },
          { recipient: 'tenant', timing: 'on_completion', message: 'New HVAC installed. Please report any issues.' },
        ],
        generatedAt: now,
      },
      createdAt: now,
      updatedAt: now,
      createdBy: 'pm-1',
      notes: 'Tenant has been very accommodating. Scheduling around their work schedule.',
      tags: ['hvac', 'upgrade', 'capital-improvement'],
    },
    {
      id: 'project-2',
      title: 'Exterior Paint Touch-up',
      description: 'Touch up peeling paint on trim and minor areas. Not a full repaint.',
      category: 'cosmetic',
      status: 'approved',
      priority: 'low',
      primaryVendorId: undefined,
      additionalVendorIds: [],
      projectOwnerId: 'pm-1',
      projectOwnerName: 'Dan Connolly',
      stakeholders: [
        {
          id: 'pm-1',
          name: 'Dan Connolly',
          role: 'pm',
          email: 'dan@propertymanager.com',
          isProjectOwner: true,
          notificationPreference: 'all',
        },
        {
          id: 'owner-1',
          name: 'Shanie Holman',
          role: 'owner',
          email: 'shanie@email.com',
          isProjectOwner: false,
          notificationPreference: 'important',
        },
      ],
      emergencyContacts: [],
      phases: [
        {
          id: 'phase-1',
          name: 'Surface Preparation',
          description: 'Scrape and sand affected areas',
          order: 1,
          status: 'pending',
          estimatedDays: 1,
        },
        {
          id: 'phase-2',
          name: 'Painting',
          description: 'Apply primer and paint',
          order: 2,
          status: 'pending',
          estimatedDays: 1,
        },
      ],
      estimatedCost: 450,
      estimatedStartDate: '2026-02-15',
      estimatedEndDate: '2026-02-16',
      createdAt: now,
      updatedAt: now,
      createdBy: 'pm-1',
      tags: ['cosmetic', 'exterior'],
    },
  ];
}
