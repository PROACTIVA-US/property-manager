/**
 * Unified Notification System
 * Aggregates notifications from all sources: Projects, Messages, Payments, Maintenance
 */

import type { UserRole } from '../contexts/AuthContext';
import { getThreads } from './messages';
import { getProjects, type Project } from './projects';
// import { getMaintenance } from './maintenance'; // Not yet implemented
// import type { PaymentRecord } from './financials'; // Not yet implemented

// Enhanced notification types
export type NotificationType =
  | 'message'
  | 'project_status'
  | 'project_assigned'
  | 'maintenance'
  | 'payment_received'
  | 'payment_due'
  | 'inspection'
  | 'responsibility'
  | 'general';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  archived: boolean;
  link?: string; // Navigation link (e.g., '/projects/123')
  actionRequired?: boolean;
  metadata?: {
    projectId?: string;
    messageId?: string;
    maintenanceId?: string;
    paymentId?: string;
  };
}

// Storage key
const NOTIFICATIONS_KEY = 'pm_notifications';

// ============ Core Functions ============

export function getNotifications(/* role?: UserRole */): Notification[] {
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  const notifications: Notification[] = data ? JSON.parse(data) : [];

  // Sort by timestamp (newest first)
  return notifications.sort((a, b) => b.timestamp - a.timestamp);
}

export function saveNotifications(notifications: Notification[]): void {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export function createNotification(notification: Omit<Notification, 'id'>): Notification {
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...notification,
    id: generateId(),
  };
  notifications.unshift(newNotification);
  saveNotifications(notifications);
  return newNotification;
}

export function markAsRead(notificationId: string): void {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    saveNotifications(notifications);
  }
}

export function markAllAsRead(): void {
  const notifications = getNotifications();
  notifications.forEach(n => n.read = true);
  saveNotifications(notifications);
}

export function archiveNotification(notificationId: string): void {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.archived = true;
    saveNotifications(notifications);
  }
}

/**
 * Mark message notification as read for a specific thread
 * Called when messages in a thread are marked as read
 */
export function markMessageNotificationAsRead(threadId: string): void {
  const notifications = getNotifications();
  let hasUpdates = false;

  notifications.forEach(notification => {
    if (
      notification.type === 'message' &&
      notification.metadata?.messageId === threadId &&
      !notification.read
    ) {
      notification.read = true;
      hasUpdates = true;
    }
  });

  if (hasUpdates) {
    saveNotifications(notifications);
  }
}

export function deleteNotification(notificationId: string): void {
  const notifications = getNotifications();
  const filtered = notifications.filter(n => n.id !== notificationId);
  saveNotifications(filtered);
}

export function getUnreadNotificationCount(): number {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read && !n.archived).length;
}

export function getUnreadByType(type: NotificationType): number {
  const notifications = getNotifications();
  return notifications.filter(n => n.type === type && !n.read && !n.archived).length;
}

// ============ Aggregation Functions ============

/**
 * Aggregate notifications from all sources
 * This creates notifications from recent activities across the app
 */
export function aggregateNotifications(_userRole: UserRole): Notification[] {
  const existing = getNotifications();
  const newNotifications: Notification[] = [];

  // Get recent unread messages
  const threads = getThreads();

  // Build a set of thread IDs that have unread messages
  const threadsWithUnread = new Set(
    threads.filter(t => t.unreadCount > 0).map(t => t.id)
  );

  // Clean up stale message notifications for threads that are now fully read
  // Mark as read any message notification where the thread now has unreadCount === 0
  let hasUpdates = false;
  existing.forEach(notification => {
    if (
      notification.type === 'message' &&
      notification.metadata?.messageId &&
      !notification.read &&
      !threadsWithUnread.has(notification.metadata.messageId)
    ) {
      // Thread was read, mark notification as read
      notification.read = true;
      hasUpdates = true;
    }
  });

  // Save updates if we marked any notifications as read
  if (hasUpdates) {
    saveNotifications(existing);
  }

  threads.forEach(thread => {
    if (thread.unreadCount > 0) {
      // Check if we already have a notification for this thread
      const hasExisting = existing.some(
        n => n.type === 'message' && n.metadata?.messageId === thread.id
      );

      if (!hasExisting) {
        newNotifications.push({
          id: generateId(),
          type: 'message',
          priority: 'normal',
          title: 'New Message',
          body: `${thread.unreadCount} new message${thread.unreadCount > 1 ? 's' : ''} in "${thread.subject}"`,
          timestamp: thread.lastMessageTime,
          read: false,
          archived: false,
          link: `/messages/${thread.id}`,
          metadata: { messageId: thread.id },
        });
      }
    }
  });

  // Get recent project updates
  const projects = getProjects();
  const recentProjects = projects.filter((p: Project) => {
    const updatedRecently = p.updatedAt &&
      (Date.now() - new Date(p.updatedAt).getTime() < 24 * 60 * 60 * 1000); // Last 24 hours
    return updatedRecently;
  });

  recentProjects.forEach((project: Project) => {
    const hasExisting = existing.some(
      n => n.type === 'project_status' && n.metadata?.projectId === project.id
    );

    if (!hasExisting) {
      newNotifications.push({
        id: generateId(),
        type: 'project_status',
        priority: project.priority === 'urgent' ? 'urgent' : 'normal',
        title: 'Project Update',
        body: `${project.title} is now ${project.status.replace('_', ' ')}`,
        timestamp: project.updatedAt ? new Date(project.updatedAt).getTime() : Date.now(),
        read: false,
        archived: false,
        link: `/projects/${project.id}`,
        actionRequired: project.status === 'pending_approval',
        metadata: { projectId: project.id },
      });
    }
  });

  // Get pending maintenance items (commented out until getMaintenance is implemented)
  // const maintenance = getMaintenance();
  // const pendingMaintenance = maintenance.filter((m: any) => m.status === 'pending');

  // TODO: Re-enable when getMaintenance is implemented
  // if (userRole === 'pm') {
  //   const hasExisting = existing.some(
  //     n => n.type === 'maintenance' && n.body.includes('pending')
  //   );
  //   if (!hasExisting) {
  //     newNotifications.push({
  //       id: generateId(),
  //       type: 'maintenance',
  //       priority: 'high',
  //       title: 'Pending Maintenance',
  //       body: `${pendingMaintenance.length} maintenance request${pendingMaintenance.length > 1 ? 's' : ''} require attention`,
  //       timestamp: Date.now(),
  //       read: false,
  //       archived: false,
  //       link: '/maintenance',
  //       actionRequired: true,
  //     });
  //   }
  // }

  // Merge with existing and save
  if (newNotifications.length > 0) {
    const all = [...newNotifications, ...existing];
    saveNotifications(all);
    return all;
  }

  return existing;
}

interface PaymentInfo {
  id: string;
  amount: number;
  paidBy: string;
  date: string;
}

/**
 * Create notification for payment received
 */
export function notifyPaymentReceived(payment: PaymentInfo): void {
  createNotification({
    type: 'payment_received',
    priority: 'normal',
    title: 'Payment Received',
    body: `Payment of $${payment.amount.toFixed(2)} received from ${payment.paidBy}`,
    timestamp: new Date(payment.date).getTime(),
    read: false,
    archived: false,
    link: '/financials',
    metadata: { paymentId: payment.id },
  });
}

/**
 * Create notification for upcoming payment due
 */
export function notifyPaymentDue(amount: number, dueDate: string): void {
  const daysUntilDue = Math.floor(
    (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  createNotification({
    type: 'payment_due',
    priority: daysUntilDue <= 3 ? 'urgent' : 'normal',
    title: 'Payment Due',
    body: `Rent payment of $${amount.toFixed(2)} due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
    timestamp: Date.now(),
    read: false,
    archived: false,
    link: '/payments',
    actionRequired: true,
  });
}

/**
 * Create notification for project assignment
 */
export function notifyProjectAssigned(projectTitle: string, projectId: string, _assignedTo: string): void {
  createNotification({
    type: 'project_assigned',
    priority: 'normal',
    title: 'New Project Assignment',
    body: `You have been assigned to "${projectTitle}"`,
    timestamp: Date.now(),
    read: false,
    archived: false,
    link: `/projects/${projectId}`,
    actionRequired: false,
    metadata: { projectId },
  });
}

/**
 * Notify owner when PM updates a project (images, status, details, etc.)
 * Creates a notification visible to the owner with a link to the project
 */
export function notifyOwnerOfProjectUpdate(params: {
  projectId: string;
  projectTitle: string;
  updateType: 'status_change' | 'images_added' | 'details_updated' | 'milestone_updated' | 'expense_added';
  updateDescription: string;
  pmName?: string;
}): void {
  const { projectId, projectTitle, updateType, updateDescription, pmName } = params;

  const typeLabels: Record<typeof updateType, string> = {
    status_change: 'Status Updated',
    images_added: 'Images Added',
    details_updated: 'Details Updated',
    milestone_updated: 'Milestone Updated',
    expense_added: 'Expense Added',
  };

  createNotification({
    type: 'project_status',
    priority: updateType === 'status_change' ? 'high' : 'normal',
    title: `Project ${typeLabels[updateType]}`,
    body: `${pmName ? `${pmName} updated ` : ''}"${projectTitle}": ${updateDescription}`,
    timestamp: Date.now(),
    read: false,
    archived: false,
    link: `/projects?view=${projectId}`,
    actionRequired: updateType === 'status_change',
    metadata: { projectId },
  });
}

/**
 * Notify stakeholders (PM and tenant) when owner makes changes
 * Used for owner actions on projects/maintenance tasks
 */
export function notifyStakeholders(params: {
  type: 'project_created' | 'project_updated' | 'project_deleted' | 'task_created' | 'task_updated' | 'task_deleted';
  itemTitle: string;
  itemId: string;
  link: string;
  stakeholders: ('pm' | 'tenant')[];
  changeDescription?: string;
}): void {
  const { type, itemTitle, itemId, link, stakeholders, changeDescription } = params;

  // Determine notification details based on action type
  const details = getNotificationDetails(type, itemTitle, changeDescription);

  // Create notifications for each stakeholder
  stakeholders.forEach(stakeholder => {
    createNotification({
      type: type.includes('project') ? 'project_status' : 'maintenance',
      priority: type.includes('deleted') ? 'high' : 'normal',
      title: details.title,
      body: `${details.body}${stakeholder === 'pm' ? ' (Owner action)' : ''}`,
      timestamp: Date.now(),
      read: false,
      archived: false,
      link,
      actionRequired: type.includes('created') || type.includes('deleted'),
      metadata: { projectId: itemId },
    });
  });
}

function getNotificationDetails(
  type: 'project_created' | 'project_updated' | 'project_deleted' | 'task_created' | 'task_updated' | 'task_deleted',
  itemTitle: string,
  changeDescription?: string
): { title: string; body: string } {
  const isProject = type.includes('project');
  const itemType = isProject ? 'project' : 'task';

  switch (type) {
    case 'project_created':
    case 'task_created':
      return {
        title: `New ${itemType} created`,
        body: `"${itemTitle}" has been created`,
      };
    case 'project_updated':
    case 'task_updated':
      return {
        title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} updated`,
        body: changeDescription || `"${itemTitle}" has been updated`,
      };
    case 'project_deleted':
    case 'task_deleted':
      return {
        title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted`,
        body: `"${itemTitle}" has been removed`,
      };
    default:
      return {
        title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} changed`,
        body: `"${itemTitle}" has been modified`,
      };
  }
}

// ============ Helper Functions ============

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    message: '💬',
    project_status: '📋',
    project_assigned: '👤',
    maintenance: '🔧',
    payment_received: '💰',
    payment_due: '💳',
    inspection: '🔍',
    responsibility: '✅',
    general: 'ℹ️',
  };
  return icons[type] || 'ℹ️';
}

export function getNotificationColor(priority: NotificationPriority): string {
  const colors: Record<NotificationPriority, string> = {
    low: 'text-gray-600',
    normal: 'text-blue-600',
    high: 'text-orange-600',
    urgent: 'text-red-600',
  };
  return colors[priority];
}

export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}
