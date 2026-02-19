/**
 * Project Management System - Supabase Implementation
 * Comprehensive project tracking with Kanban workflow, stakeholder management,
 * messaging, and AI-assisted impact analysis
 */

import { supabase } from './supabase';
import type { Tables, TablesInsert, TablesUpdate } from './database.types';
import type { UserRole } from '../contexts/AuthContext';

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
  | 'landscaping'
  | 'hvac'
  | 'plumbing'
  | 'electrical'
  | 'other';

// Database types
type DbProject = Tables<'projects'>;
type DbProjectPhase = Tables<'project_phases'>;
// DbProjectMessage and DbProjectAttachment used implicitly via Supabase queries

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
  landscaping: 'Landscaping',
  hvac: 'HVAC',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  other: 'Other',
};

// Stakeholder in a project (stored as JSONB or separate table in future)
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
  relationship: string;
}

// Project attachment (from database)
export interface ProjectAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
  category: 'before' | 'during' | 'after' | 'estimate' | 'plan' | 'other';
}

// Project message (from database)
export interface ProjectMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  isSystemMessage: boolean;
  readBy: string[];
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

// Project phase/milestone
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

// Main Project interface (app layer)
export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  priority: ProjectPriority;
  propertyId?: string;

  // Vendor association
  primaryVendorId?: string;
  additionalVendorIds: string[];

  // Project owner
  projectOwnerId: string;
  projectOwnerName: string;

  // Stakeholders (stored as part of impact_analysis JSONB for now)
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

  // Messages (loaded separately)
  messages: ProjectMessage[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;

  // Notes and tags
  notes?: string;
  tags: string[];
}

// ============ Demo Mode Storage ============

const DEMO_PROJECTS_KEY = 'propertyMgr_projects';
const DEMO_ATTACHMENTS_KEY = 'propertyMgr_projectAttachments';

function isDemoMode(): boolean {
  const demoUser = localStorage.getItem('demoUser');
  return !!demoUser;
}

// ============ Helper Functions ============

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

// Map database project to app Project type
function mapDbToProject(
  dbProject: DbProject,
  phases: DbProjectPhase[] = [],
  messages: ProjectMessage[] = []
): Project {
  const impactData = dbProject.impact_analysis as {
    stakeholders?: Stakeholder[];
    emergencyContacts?: EmergencyContact[];
    additionalVendorIds?: string[];
    notes?: string;
    tags?: string[];
    projectOwnerName?: string;
    analysis?: ImpactAnalysis;
  } | null;

  return {
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description || '',
    category: dbProject.category as ProjectCategory,
    status: dbProject.status as ProjectStatus,
    priority: dbProject.priority as ProjectPriority,
    propertyId: dbProject.property_id || undefined,
    primaryVendorId: dbProject.primary_vendor_id || undefined,
    additionalVendorIds: impactData?.additionalVendorIds || [],
    projectOwnerId: dbProject.created_by || '',
    projectOwnerName: impactData?.projectOwnerName || 'Unknown',
    stakeholders: impactData?.stakeholders || [],
    emergencyContacts: impactData?.emergencyContacts || [],
    phases: phases.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      order: p.order_index,
      status: p.status as ProjectPhase['status'],
      startDate: p.start_date || undefined,
      endDate: p.end_date || undefined,
      estimatedDays: p.estimated_days || undefined,
      assignedVendorId: p.assigned_vendor_id || undefined,
      notes: p.notes || undefined,
    })),
    estimatedCost: dbProject.estimated_cost ? Number(dbProject.estimated_cost) : undefined,
    actualCost: dbProject.actual_cost ? Number(dbProject.actual_cost) : undefined,
    estimatedStartDate: dbProject.estimated_start_date || undefined,
    estimatedEndDate: dbProject.estimated_end_date || undefined,
    actualStartDate: dbProject.actual_start_date || undefined,
    actualEndDate: dbProject.actual_end_date || undefined,
    impactAnalysis: impactData?.analysis,
    messages,
    createdAt: dbProject.created_at || new Date().toISOString(),
    updatedAt: dbProject.updated_at || new Date().toISOString(),
    createdBy: dbProject.created_by || '',
    notes: impactData?.notes,
    tags: impactData?.tags || [],
  };
}

// ============ Project CRUD - Supabase ============

export async function getProjectsAsync(): Promise<Project[]> {
  if (isDemoMode()) {
    return getProjects();
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  // Fetch phases for all projects
  const projectIds = projects.map(p => p.id);
  const { data: phases } = await supabase
    .from('project_phases')
    .select('*')
    .in('project_id', projectIds)
    .order('order_index');

  // Group phases by project
  const phasesByProject = (phases || []).reduce((acc, phase) => {
    const pid = phase.project_id!;
    if (!acc[pid]) acc[pid] = [];
    acc[pid].push(phase);
    return acc;
  }, {} as Record<string, DbProjectPhase[]>);

  return projects.map(p => mapDbToProject(p, phasesByProject[p.id] || []));
}

export async function getProjectByIdAsync(id: string): Promise<Project | null> {
  if (isDemoMode()) {
    return getProjectById(id) || null;
  }

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !project) {
    console.error('Error fetching project:', error);
    return null;
  }

  // Fetch phases
  const { data: phases } = await supabase
    .from('project_phases')
    .select('*')
    .eq('project_id', id)
    .order('order_index');

  // Fetch messages with sender info
  const messages = await getProjectMessagesAsync(id);

  return mapDbToProject(project, phases || [], messages);
}

export async function getProjectsByStatusAsync(status: ProjectStatus): Promise<Project[]> {
  if (isDemoMode()) {
    return getProjectsByStatus(status);
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', status)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects by status:', error);
    return [];
  }

  const projectIds = projects.map(p => p.id);
  const { data: phases } = await supabase
    .from('project_phases')
    .select('*')
    .in('project_id', projectIds)
    .order('order_index');

  const phasesByProject = (phases || []).reduce((acc, phase) => {
    const pid = phase.project_id!;
    if (!acc[pid]) acc[pid] = [];
    acc[pid].push(phase);
    return acc;
  }, {} as Record<string, DbProjectPhase[]>);

  return projects.map(p => mapDbToProject(p, phasesByProject[p.id] || []));
}

export async function getProjectsByVendorAsync(vendorId: string): Promise<Project[]> {
  if (isDemoMode()) {
    return getProjectsByVendor(vendorId);
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('primary_vendor_id', vendorId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects by vendor:', error);
    return [];
  }

  return projects.map(p => mapDbToProject(p));
}

export async function createProjectAsync(
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'messages'>
): Promise<Project> {
  if (isDemoMode()) {
    return createProject({ ...data, messages: [] });
  }

  // Prepare impact_analysis JSONB with extra fields
  const impactAnalysis = {
    stakeholders: data.stakeholders,
    emergencyContacts: data.emergencyContacts,
    additionalVendorIds: data.additionalVendorIds,
    notes: data.notes,
    tags: data.tags,
    projectOwnerName: data.projectOwnerName,
    analysis: data.impactAnalysis,
  };

  const insertData: TablesInsert<'projects'> = {
    title: data.title,
    description: data.description,
    category: data.category,
    status: data.status,
    priority: data.priority,
    property_id: data.propertyId,
    primary_vendor_id: data.primaryVendorId,
    created_by: data.createdBy || undefined,
    assigned_to: data.projectOwnerId || undefined,
    estimated_cost: data.estimatedCost,
    actual_cost: data.actualCost,
    estimated_start_date: data.estimatedStartDate,
    estimated_end_date: data.estimatedEndDate,
    actual_start_date: data.actualStartDate,
    actual_end_date: data.actualEndDate,
    impact_analysis: impactAnalysis as any,
  };

  const { data: project, error } = await supabase
    .from('projects')
    .insert(insertData)
    .select()
    .single();

  if (error || !project) {
    throw new Error('Failed to create project: ' + error?.message);
  }

  // Create phases
  if (data.phases.length > 0) {
    const phasesInsert: TablesInsert<'project_phases'>[] = data.phases.map((p, idx) => ({
      project_id: project.id,
      name: p.name,
      description: p.description,
      order_index: p.order || idx,
      status: p.status,
      start_date: p.startDate,
      end_date: p.endDate,
      estimated_days: p.estimatedDays,
      assigned_vendor_id: p.assignedVendorId,
      notes: p.notes,
    }));

    await supabase.from('project_phases').insert(phasesInsert);
  }

  // Create system message
  await createProjectMessageAsync({
    projectId: project.id,
    senderId: 'system',
    senderName: 'System',
    senderRole: null,
    content: `Project "${project.title}" was created.`,
    isSystemMessage: true,
    readBy: [],
  });

  return (await getProjectByIdAsync(project.id))!;
}

export async function updateProjectAsync(
  id: string,
  updates: Partial<Omit<Project, 'id' | 'createdAt'>>
): Promise<Project | null> {
  if (isDemoMode()) {
    return updateProject(id, updates);
  }

  // Get old project to check status change
  const oldProject = await getProjectByIdAsync(id);
  if (!oldProject) return null;

  // Prepare update data
  const impactAnalysis = {
    stakeholders: updates.stakeholders ?? oldProject.stakeholders,
    emergencyContacts: updates.emergencyContacts ?? oldProject.emergencyContacts,
    additionalVendorIds: updates.additionalVendorIds ?? oldProject.additionalVendorIds,
    notes: updates.notes ?? oldProject.notes,
    tags: updates.tags ?? oldProject.tags,
    projectOwnerName: updates.projectOwnerName ?? oldProject.projectOwnerName,
    analysis: updates.impactAnalysis ?? oldProject.impactAnalysis,
  };

  const updateData: TablesUpdate<'projects'> = {
    title: updates.title,
    description: updates.description,
    category: updates.category,
    status: updates.status,
    priority: updates.priority,
    property_id: updates.propertyId,
    primary_vendor_id: updates.primaryVendorId,
    assigned_to: updates.projectOwnerId,
    estimated_cost: updates.estimatedCost,
    actual_cost: updates.actualCost,
    estimated_start_date: updates.estimatedStartDate,
    estimated_end_date: updates.estimatedEndDate,
    actual_start_date: updates.actualStartDate,
    actual_end_date: updates.actualEndDate,
    impact_analysis: impactAnalysis as any,
  };

  // Remove undefined values
  Object.keys(updateData).forEach(key => {
    if (updateData[key as keyof typeof updateData] === undefined) {
      delete updateData[key as keyof typeof updateData];
    }
  });

  const { error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating project:', error);
    return null;
  }

  // Update phases if provided
  if (updates.phases) {
    // Delete existing phases and recreate
    await supabase.from('project_phases').delete().eq('project_id', id);

    if (updates.phases.length > 0) {
      const phasesInsert: TablesInsert<'project_phases'>[] = updates.phases.map((p, idx) => ({
        project_id: id,
        name: p.name,
        description: p.description,
        order_index: p.order || idx,
        status: p.status,
        start_date: p.startDate,
        end_date: p.endDate,
        estimated_days: p.estimatedDays,
        assigned_vendor_id: p.assignedVendorId,
        notes: p.notes,
      }));

      await supabase.from('project_phases').insert(phasesInsert);
    }
  }

  // Create system message if status changed
  if (updates.status && updates.status !== oldProject.status) {
    await createProjectMessageAsync({
      projectId: id,
      senderId: 'system',
      senderName: 'System',
      senderRole: null,
      content: `Project status changed from "${STATUS_LABELS[oldProject.status]}" to "${STATUS_LABELS[updates.status]}".`,
      isSystemMessage: true,
      readBy: [],
    });
  }

  return getProjectByIdAsync(id);
}

export async function deleteProjectAsync(id: string): Promise<boolean> {
  if (isDemoMode()) {
    return deleteProject(id);
  }

  // Delete phases, messages, attachments (cascade should handle this)
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    return false;
  }

  return true;
}

// ============ Project Messages - Supabase ============

export async function getProjectMessagesAsync(projectId: string): Promise<ProjectMessage[]> {
  if (isDemoMode()) {
    return getProjectMessages(projectId);
  }

  const { data: messages, error } = await supabase
    .from('project_messages')
    .select(`
      *,
      sender:profiles!project_messages_sender_id_fkey(display_name, role)
    `)
    .eq('project_id', projectId)
    .order('created_at');

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  // Fetch read receipts
  const messageIds = messages.map(m => m.id);
  const { data: reads } = await supabase
    .from('project_message_reads')
    .select('message_id, user_id')
    .in('message_id', messageIds);

  const readsByMessage = (reads || []).reduce((acc, r) => {
    if (!acc[r.message_id]) acc[r.message_id] = [];
    acc[r.message_id].push(r.user_id);
    return acc;
  }, {} as Record<string, string[]>);

  return messages.map(m => ({
    id: m.id,
    projectId: m.project_id || '',
    senderId: m.sender_id || 'system',
    senderName: (m.sender as { display_name: string } | null)?.display_name || 'System',
    senderRole: ((m.sender as { role: string } | null)?.role as UserRole) || null,
    content: m.content,
    timestamp: m.created_at || new Date().toISOString(),
    isSystemMessage: m.is_system_message || false,
    readBy: readsByMessage[m.id] || [],
  }));
}

export async function createProjectMessageAsync(
  data: Omit<ProjectMessage, 'id' | 'timestamp'>
): Promise<ProjectMessage> {
  if (isDemoMode()) {
    return createProjectMessage(data);
  }

  const insertData: TablesInsert<'project_messages'> = {
    project_id: data.projectId,
    sender_id: data.senderId === 'system' ? null : data.senderId,
    content: data.content,
    is_system_message: data.isSystemMessage,
  };

  const { data: message, error } = await supabase
    .from('project_messages')
    .insert(insertData)
    .select()
    .single();

  if (error || !message) {
    throw new Error('Failed to create message: ' + error?.message);
  }

  return {
    id: message.id,
    projectId: message.project_id || '',
    senderId: message.sender_id || 'system',
    senderName: data.senderName,
    senderRole: data.senderRole,
    content: message.content,
    timestamp: message.created_at || new Date().toISOString(),
    isSystemMessage: message.is_system_message || false,
    readBy: [],
  };
}

export async function markMessagesAsReadAsync(projectId: string, userId: string): Promise<void> {
  if (isDemoMode()) {
    markMessagesAsRead(projectId, userId);
    return;
  }

  // Get unread messages for this project
  const { data: messages } = await supabase
    .from('project_messages')
    .select('id')
    .eq('project_id', projectId);

  if (!messages || messages.length === 0) return;

  // Upsert read receipts
  const reads = messages.map(m => ({
    message_id: m.id,
    user_id: userId,
  }));

  await supabase
    .from('project_message_reads')
    .upsert(reads, { onConflict: 'message_id,user_id' });
}

export async function getUnreadMessageCountAsync(projectId: string, userId: string): Promise<number> {
  if (isDemoMode()) {
    return getUnreadMessageCount(projectId, userId);
  }

  const { count, error } = await supabase
    .from('project_messages')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .neq('sender_id', userId)
    .not('id', 'in', supabase
      .from('project_message_reads')
      .select('message_id')
      .eq('user_id', userId)
    );

  if (error) {
    console.error('Error counting unread messages:', error);
    return 0;
  }

  return count || 0;
}

// ============ Project Attachments - Supabase Storage ============

export async function getProjectAttachmentsAsync(projectId: string): Promise<ProjectAttachment[]> {
  if (isDemoMode()) {
    return getProjectAttachments(projectId);
  }

  const { data, error } = await supabase
    .from('project_attachments')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching attachments:', error);
    return [];
  }

  return data.map(a => ({
    id: a.id,
    fileName: a.file_name,
    fileSize: a.file_size || 0,
    mimeType: a.mime_type || '',
    storagePath: a.storage_path,
    uploadedAt: a.created_at || new Date().toISOString(),
    uploadedBy: a.uploaded_by || '',
    description: a.description || undefined,
    category: (a.category as ProjectAttachment['category']) || 'other',
  }));
}

export async function createProjectAttachmentAsync(
  projectId: string,
  file: File,
  uploadedBy: string,
  category: ProjectAttachment['category'],
  description?: string
): Promise<ProjectAttachment> {
  if (isDemoMode()) {
    return createProjectAttachment(projectId, file, uploadedBy, category, description);
  }

  // Upload to Supabase Storage
  const fileName = `${projectId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('project-attachments')
    .upload(fileName, file);

  if (uploadError) {
    throw new Error('Failed to upload file: ' + uploadError.message);
  }

  // Create database record
  const insertData: TablesInsert<'project_attachments'> = {
    project_id: projectId,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
    storage_path: fileName,
    category,
    description,
    uploaded_by: uploadedBy,
  };

  const { data, error } = await supabase
    .from('project_attachments')
    .insert(insertData)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to create attachment record: ' + error?.message);
  }

  return {
    id: data.id,
    fileName: data.file_name,
    fileSize: data.file_size || 0,
    mimeType: data.mime_type || '',
    storagePath: data.storage_path,
    uploadedAt: data.created_at || new Date().toISOString(),
    uploadedBy: data.uploaded_by || '',
    description: data.description || undefined,
    category: (data.category as ProjectAttachment['category']) || 'other',
  };
}

export async function getAttachmentUrlAsync(storagePath: string): Promise<string> {
  const { data } = supabase.storage
    .from('project-attachments')
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

export async function deleteProjectAttachmentAsync(attachmentId: string): Promise<boolean> {
  if (isDemoMode()) {
    return deleteProjectAttachment(attachmentId);
  }

  // Get attachment to find storage path
  const { data: attachment } = await supabase
    .from('project_attachments')
    .select('storage_path')
    .eq('id', attachmentId)
    .single();

  if (attachment) {
    // Delete from storage
    await supabase.storage
      .from('project-attachments')
      .remove([attachment.storage_path]);
  }

  // Delete database record
  const { error } = await supabase
    .from('project_attachments')
    .delete()
    .eq('id', attachmentId);

  return !error;
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

  // Analyze based on category
  switch (project.category) {
    case 'hvac':
    case 'renovation':
      analysis.tenantImpact = {
        level: 'significant',
        description: 'Work will require property access and may cause temporary disruption.',
        recommendations: [
          'Provide 48-hour advance notice',
          'Share detailed work schedule',
          'Arrange dust barriers if needed',
        ],
        estimatedDuration: project.phases.length > 0
          ? `${project.phases.reduce((sum, p) => sum + (p.estimatedDays || 0), 0)} days`
          : 'TBD',
      };
      analysis.ownerImpact = {
        level: 'moderate',
        description: 'Capital investment with long-term value.',
        recommendations: ['Track expenses for tax purposes', 'Get multiple bids'],
      };
      break;

    case 'repair':
    case 'plumbing':
    case 'electrical':
      analysis.tenantImpact = {
        level: 'moderate',
        description: 'Repair work requires temporary access.',
        recommendations: ['Schedule during convenient hours', 'Provide 24-hour notice'],
        estimatedDuration: '1-3 days',
      };
      analysis.ownerImpact = {
        level: 'minimal',
        description: 'Standard maintenance expense.',
        recommendations: ['Review warranty coverage'],
      };
      break;

    case 'inspection':
      analysis.tenantImpact = {
        level: 'minimal',
        description: 'Brief inspection requiring coordination.',
        recommendations: ['Provide 48-hour notice', 'Keep under 1 hour'],
        estimatedDuration: '30-60 minutes',
      };
      analysis.ownerImpact = {
        level: 'none',
        description: 'Routine inspection.',
        recommendations: ['Review findings promptly'],
      };
      break;

    default:
      analysis.tenantImpact = {
        level: 'minimal',
        description: 'Impact to be determined based on scope.',
        recommendations: ['Communicate timeline clearly'],
      };
      analysis.ownerImpact = {
        level: 'minimal',
        description: 'Review estimates before approval.',
        recommendations: [],
      };
  }

  if (project.priority === 'urgent' || project.priority === 'high') {
    analysis.suggestedNotifications.push({
      recipient: 'pm',
      timing: 'immediate',
      message: `High priority project "${project.title}" requires attention.`,
    });
  }

  return analysis;
}

// ============ Statistics ============

export async function getProjectStatsAsync() {
  if (isDemoMode()) {
    return getProjectStats();
  }

  const projects = await getProjectsAsync();

  const byStatus: Record<ProjectStatus, number> = {
    draft: 0,
    pending_approval: 0,
    approved: 0,
    in_progress: 0,
    on_hold: 0,
    completed: 0,
    cancelled: 0,
  };

  const byCategory: Record<string, number> = {};
  let totalEstimatedCost = 0;
  let totalActualCost = 0;

  projects.forEach(p => {
    byStatus[p.status]++;
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    if (p.estimatedCost) totalEstimatedCost += p.estimatedCost;
    if (p.actualCost) totalActualCost += p.actualCost;
  });

  return {
    total: projects.length,
    byStatus,
    byCategory,
    activeCount: byStatus.in_progress + byStatus.approved + byStatus.pending_approval,
    completedCount: byStatus.completed,
    totalEstimatedCost,
    totalActualCost,
  };
}

// ============ Synchronous Functions (Demo Mode / Backwards Compatibility) ============

export function getProjects(): Project[] {
  try {
    const stored = localStorage.getItem(DEMO_PROJECTS_KEY);
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
    localStorage.setItem(DEMO_PROJECTS_KEY, JSON.stringify(projects));
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
    messages: data.messages || [],
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  projects.push(newProject);
  saveProjects(projects);

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
  return true;
}

export function getProjectMessages(projectId: string): ProjectMessage[] {
  const project = getProjectById(projectId);
  if (!project) return [];
  return project.messages.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

export function getAllProjectMessages(): ProjectMessage[] {
  return getProjects().flatMap(p => p.messages);
}

export function saveProjectMessages(): void {
  console.warn('saveProjectMessages is deprecated.');
}

export function createProjectMessage(
  data: Omit<ProjectMessage, 'id' | 'timestamp'>
): ProjectMessage {
  const projects = getProjects();
  const projectIndex = projects.findIndex(p => p.id === data.projectId);

  if (projectIndex === -1) {
    throw new Error(`Project with id ${data.projectId} not found`);
  }

  const newMessage: ProjectMessage = {
    ...data,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };

  projects[projectIndex].messages.push(newMessage);
  projects[projectIndex].updatedAt = new Date().toISOString();
  saveProjects(projects);

  return newMessage;
}

export function markMessagesAsRead(projectId: string, userId: string): void {
  const projects = getProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);

  if (projectIndex === -1) return;

  projects[projectIndex].messages = projects[projectIndex].messages.map(m => {
    if (!m.readBy.includes(userId)) {
      return { ...m, readBy: [...m.readBy, userId] };
    }
    return m;
  });

  saveProjects(projects);
}

export function getUnreadMessageCount(projectId: string, userId: string): number {
  const messages = getProjectMessages(projectId);
  return messages.filter(m => !m.readBy.includes(userId) && m.senderId !== userId).length;
}

export function getProjectAttachments(projectId: string): ProjectAttachment[] {
  try {
    const stored = localStorage.getItem(DEMO_ATTACHMENTS_KEY);
    const all: (ProjectAttachment & { dataUrl?: string })[] = stored ? JSON.parse(stored) : [];
    return all.filter(a => a.id.startsWith(projectId)).map(a => ({
      ...a,
      storagePath: a.storagePath || a.dataUrl || '',
    }));
  } catch (error) {
    console.error('Error reading attachments:', error);
    return [];
  }
}

export function getAllProjectAttachments(): ProjectAttachment[] {
  try {
    const stored = localStorage.getItem(DEMO_ATTACHMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading attachments:', error);
    return [];
  }
}

export function saveProjectAttachments(attachments: ProjectAttachment[]): void {
  try {
    localStorage.setItem(DEMO_ATTACHMENTS_KEY, JSON.stringify(attachments));
  } catch (error) {
    console.error('Error saving attachments:', error);
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
        storagePath: reader.result as string,
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

  const byCategory: Record<string, number> = {};
  let totalEstimatedCost = 0;
  let totalActualCost = 0;

  projects.forEach(p => {
    byStatus[p.status]++;
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    if (p.estimatedCost) totalEstimatedCost += p.estimatedCost;
    if (p.actualCost) totalActualCost += p.actualCost;
  });

  return {
    total: projects.length,
    byStatus,
    byCategory,
    activeCount: byStatus.in_progress + byStatus.approved + byStatus.pending_approval,
    completedCount: byStatus.completed,
    totalEstimatedCost,
    totalActualCost,
  };
}

// ============ Default Demo Data ============

function getDefaultProjects(): Project[] {
  const now = new Date().toISOString();

  return [
    {
      id: 'project-1',
      title: 'HVAC System Upgrade',
      description: 'Replace aging HVAC unit with a more efficient model.',
      category: 'hvac',
      status: 'in_progress',
      priority: 'high',
      primaryVendorId: 'vendor-4',
      additionalVendorIds: [],
      projectOwnerId: 'pm-1',
      projectOwnerName: 'Dan Connolly',
      stakeholders: [],
      emergencyContacts: [],
      phases: [
        { id: 'phase-1', name: 'Site Assessment', description: 'Initial inspection', order: 1, status: 'completed', estimatedDays: 1 },
        { id: 'phase-2', name: 'Equipment Procurement', description: 'Order new unit', order: 2, status: 'completed', estimatedDays: 5 },
        { id: 'phase-3', name: 'Installation', description: 'Install new HVAC', order: 3, status: 'in_progress', estimatedDays: 2 },
        { id: 'phase-4', name: 'Testing', description: 'Test and commission', order: 4, status: 'pending', estimatedDays: 1 },
      ],
      estimatedCost: 8500,
      estimatedStartDate: '2026-01-20',
      estimatedEndDate: '2026-01-30',
      actualStartDate: '2026-01-20',
      createdAt: now,
      updatedAt: now,
      createdBy: 'pm-1',
      tags: ['hvac', 'upgrade'],
      messages: [],
    },
    {
      id: 'project-2',
      title: 'Exterior Paint Touch-up',
      description: 'Touch up peeling paint on trim.',
      category: 'maintenance',
      status: 'approved',
      priority: 'low',
      additionalVendorIds: [],
      projectOwnerId: 'pm-1',
      projectOwnerName: 'Dan Connolly',
      stakeholders: [],
      emergencyContacts: [],
      phases: [
        { id: 'phase-1', name: 'Prep Work', description: 'Scrape and sand', order: 1, status: 'pending', estimatedDays: 1 },
        { id: 'phase-2', name: 'Painting', description: 'Apply paint', order: 2, status: 'pending', estimatedDays: 1 },
      ],
      estimatedCost: 450,
      estimatedStartDate: '2026-02-15',
      estimatedEndDate: '2026-02-16',
      createdAt: now,
      updatedAt: now,
      createdBy: 'pm-1',
      tags: ['exterior', 'cosmetic'],
      messages: [],
    },
  ];
}

// Export generateId for other modules
export { generateId };
