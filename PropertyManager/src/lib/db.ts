/**
 * PropertyManager IndexedDB Database
 *
 * Uses Dexie.js for IndexedDB abstraction.
 * Provides the foundation for migrating from localStorage to IndexedDB.
 *
 * Benefits of IndexedDB over localStorage:
 * - Larger storage capacity (50MB+ vs 5-10MB)
 * - Async operations don't block UI
 * - Better support for structured data
 * - Required for robust PWA offline support
 */

import Dexie, { type EntityTable } from 'dexie';

// ============================================================================
// Database Entity Interfaces
// ============================================================================

export interface DBSettings {
  id: string;
  data: Record<string, unknown>;
  updatedAt: string;
}

export interface DBProject {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  data: Record<string, unknown>;
}

export interface DBIssue {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  reportedBy: string;
  reportedAt: string;
  updatedAt: string;
  data: Record<string, unknown>;
}

export interface DBVendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  data: Record<string, unknown>;
}

export interface DBDocument {
  id: string;
  name: string;
  type: string;
  folderId: string;
  createdAt: string;
  data: Record<string, unknown>;
}

export interface DBMessage {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  sentAt: string;
  data: Record<string, unknown>;
}

export interface DBThread {
  id: string;
  participants: string[];
  lastMessageAt: string;
  data: Record<string, unknown>;
}

export interface DBNotification {
  id: string;
  type: string;
  title: string;
  read: boolean;
  createdAt: string;
  data: Record<string, unknown>;
}

export interface DBMaintenanceTask {
  id: string;
  title: string;
  category: string;
  frequency: string;
  dueDate?: string;
  completedAt?: string;
  data: Record<string, unknown>;
}

export interface DBPayment {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt?: string;
  data: Record<string, unknown>;
}

export interface DBGalleryImage {
  id: string;
  room: string;
  url: string;
  caption?: string;
  uploadedAt: string;
  data: Record<string, unknown>;
}

export interface DBBOM {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  data: Record<string, unknown>;
}

export interface DB3DModel {
  id: string;
  name: string;
  type: string;
  category: string;
  favorite: boolean;
  data: Record<string, unknown>;
}

export interface DBSyncQueue {
  id: string;
  operation: 'create' | 'update' | 'delete';
  store: string;
  recordId: string;
  payload: Record<string, unknown>;
  createdAt: string;
  attempts: number;
  lastAttemptAt?: string;
  error?: string;
}

// ============================================================================
// Database Definition
// ============================================================================

export class PropertyManagerDB extends Dexie {
  settings!: EntityTable<DBSettings, 'id'>;
  projects!: EntityTable<DBProject, 'id'>;
  issues!: EntityTable<DBIssue, 'id'>;
  vendors!: EntityTable<DBVendor, 'id'>;
  documents!: EntityTable<DBDocument, 'id'>;
  messages!: EntityTable<DBMessage, 'id'>;
  threads!: EntityTable<DBThread, 'id'>;
  notifications!: EntityTable<DBNotification, 'id'>;
  maintenanceTasks!: EntityTable<DBMaintenanceTask, 'id'>;
  payments!: EntityTable<DBPayment, 'id'>;
  galleryImages!: EntityTable<DBGalleryImage, 'id'>;
  boms!: EntityTable<DBBOM, 'id'>;
  models3d!: EntityTable<DB3DModel, 'id'>;
  syncQueue!: EntityTable<DBSyncQueue, 'id'>;

  constructor() {
    super('PropertyManagerDB');

    // Define schema with indexes
    this.version(1).stores({
      settings: 'id',
      projects: 'id, name, status, createdAt, updatedAt',
      issues: 'id, title, status, priority, category, reportedBy, reportedAt, updatedAt',
      vendors: 'id, name, category, rating',
      documents: 'id, name, type, folderId, createdAt',
      messages: 'id, threadId, senderId, sentAt',
      threads: 'id, lastMessageAt, *participants',
      notifications: 'id, type, read, createdAt',
      maintenanceTasks: 'id, category, frequency, dueDate, completedAt',
      payments: 'id, status, dueDate, paidAt',
      galleryImages: 'id, room, uploadedAt',
      boms: 'id, projectId, createdAt',
      models3d: 'id, name, type, category, favorite',
      syncQueue: 'id, store, recordId, createdAt, attempts'
    });
  }
}

// Singleton database instance
export const db = new PropertyManagerDB();

// ============================================================================
// Migration Utilities
// ============================================================================

const LOCALSTORAGE_KEYS = {
  settings: 'propertyManagerSettings',
  projects: 'propertyMgr_projects',
  projectAttachments: 'propertyMgr_projectAttachments',
  issues: 'propertyMgr_issues',
  vendors: 'propertyMgr_vendors',
  estimates: 'propertyMgr_estimates',
  jobHistory: 'propertyMgr_jobHistory',
  documents: 'propertyMgr_documents',
  threads: 'propertyMgr_threads',
  messages: 'propertyMgr_messages',
  notifications: 'propertyMgr_notifications',
  maintenanceTasks: 'propertyMgr_maintenance',
  payments: 'propertyMgr_payments',
  lease: 'propertyMgr_lease',
  maintenanceRequests: 'propertyMgr_maintenanceRequests',
  galleryImages: 'propertyMgr_gallery',
  boms: 'propertyMgr_boms',
  models3d: 'propertyMgr_3dModels',
  modelFavorites: 'propertyMgr_modelFavorites',
  responsibilities: 'propertyMgr_responsibilities',
  approvalRequests: 'propertyMgr_approvalRequests',
  zillow: 'propertyMgr_zillow',
  inspections: 'propertyMgr_inspections',
  satisfaction: 'propertyMgr_satisfaction'
};

/**
 * Check if migration from localStorage has been completed
 */
export async function isMigrationComplete(): Promise<boolean> {
  try {
    const settings = await db.settings.get('migration');
    return settings?.data?.completed === true;
  } catch {
    return false;
  }
}

/**
 * Mark migration as complete
 */
export async function markMigrationComplete(): Promise<void> {
  await db.settings.put({
    id: 'migration',
    data: { completed: true, migratedAt: new Date().toISOString() },
    updatedAt: new Date().toISOString()
  });
}

/**
 * Migrate all data from localStorage to IndexedDB
 * Can be called manually or on app initialization
 */
export async function migrateFromLocalStorage(): Promise<{
  success: boolean;
  migrated: string[];
  errors: string[];
}> {
  const migrated: string[] = [];
  const errors: string[] = [];

  // Check if already migrated
  if (await isMigrationComplete()) {
    return { success: true, migrated: [], errors: [] };
  }

  try {
    // Migrate settings
    const settingsData = localStorage.getItem(LOCALSTORAGE_KEYS.settings);
    if (settingsData) {
      try {
        const settings = JSON.parse(settingsData);
        await db.settings.put({
          id: 'app',
          data: settings,
          updatedAt: new Date().toISOString()
        });
        migrated.push('settings');
      } catch (e) {
        errors.push(`settings: ${e}`);
      }
    }

    // Migrate projects
    const projectsData = localStorage.getItem(LOCALSTORAGE_KEYS.projects);
    if (projectsData) {
      try {
        const projects = JSON.parse(projectsData);
        for (const project of projects) {
          await db.projects.put({
            id: project.id,
            name: project.name,
            status: project.status,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt || project.createdAt,
            data: project
          });
        }
        migrated.push('projects');
      } catch (e) {
        errors.push(`projects: ${e}`);
      }
    }

    // Migrate issues
    const issuesData = localStorage.getItem(LOCALSTORAGE_KEYS.issues);
    if (issuesData) {
      try {
        const issues = JSON.parse(issuesData);
        for (const issue of issues) {
          await db.issues.put({
            id: issue.id,
            title: issue.title,
            status: issue.status,
            priority: issue.priority,
            category: issue.category,
            reportedBy: issue.reportedBy,
            reportedAt: issue.reportedAt,
            updatedAt: issue.updatedAt || issue.reportedAt,
            data: issue
          });
        }
        migrated.push('issues');
      } catch (e) {
        errors.push(`issues: ${e}`);
      }
    }

    // Migrate vendors
    const vendorsData = localStorage.getItem(LOCALSTORAGE_KEYS.vendors);
    if (vendorsData) {
      try {
        const vendors = JSON.parse(vendorsData);
        for (const vendor of vendors) {
          await db.vendors.put({
            id: vendor.id,
            name: vendor.name,
            category: vendor.category,
            rating: vendor.rating || 0,
            data: vendor
          });
        }
        migrated.push('vendors');
      } catch (e) {
        errors.push(`vendors: ${e}`);
      }
    }

    // Migrate notifications
    const notificationsData = localStorage.getItem(LOCALSTORAGE_KEYS.notifications);
    if (notificationsData) {
      try {
        const notifications = JSON.parse(notificationsData);
        for (const notification of notifications) {
          await db.notifications.put({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            read: notification.read || false,
            createdAt: notification.createdAt,
            data: notification
          });
        }
        migrated.push('notifications');
      } catch (e) {
        errors.push(`notifications: ${e}`);
      }
    }

    // Migrate BOMs
    const bomsData = localStorage.getItem(LOCALSTORAGE_KEYS.boms);
    if (bomsData) {
      try {
        const boms = JSON.parse(bomsData);
        for (const bom of boms) {
          await db.boms.put({
            id: bom.id,
            projectId: bom.projectId,
            name: bom.name,
            createdAt: bom.createdAt,
            data: bom
          });
        }
        migrated.push('boms');
      } catch (e) {
        errors.push(`boms: ${e}`);
      }
    }

    // Mark migration as complete
    await markMigrationComplete();

    console.log('[DB] Migration completed:', { migrated, errors });
    return { success: errors.length === 0, migrated, errors };
  } catch (error) {
    console.error('[DB] Migration failed:', error);
    return { success: false, migrated, errors: [...errors, String(error)] };
  }
}

// ============================================================================
// Wrapper Functions (match existing localStorage API)
// ============================================================================

/**
 * Generic get wrapper that falls back to localStorage
 */
export async function dbGet<T>(
  table: 'settings' | 'projects' | 'issues' | 'vendors' | 'notifications' | 'boms',
  id: string,
  localStorageKey?: string
): Promise<T | undefined> {
  try {
    const record = await db[table].get(id);
    if (record) {
      return record.data as T;
    }
  } catch {
    // Fall back to localStorage
    if (localStorageKey) {
      const data = localStorage.getItem(localStorageKey);
      if (data) {
        return JSON.parse(data) as T;
      }
    }
  }
  return undefined;
}

/**
 * Generic getAll wrapper that falls back to localStorage
 */
export async function dbGetAll<T>(
  table: 'projects' | 'issues' | 'vendors' | 'notifications' | 'boms',
  localStorageKey?: string
): Promise<T[]> {
  try {
    const records = await db[table].toArray();
    if (records.length > 0) {
      return records.map(r => r.data as T);
    }
  } catch {
    // Fall back to localStorage
    if (localStorageKey) {
      const data = localStorage.getItem(localStorageKey);
      if (data) {
        return JSON.parse(data) as T[];
      }
    }
  }
  return [];
}

// ============================================================================
// Sync Queue for Offline Support
// ============================================================================

/**
 * Add an operation to the sync queue for later processing
 */
export async function queueSync(
  operation: 'create' | 'update' | 'delete',
  store: string,
  recordId: string,
  payload: Record<string, unknown>
): Promise<void> {
  await db.syncQueue.add({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    operation,
    store,
    recordId,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0
  });
}

/**
 * Get pending sync operations
 */
export async function getPendingSyncOps(): Promise<DBSyncQueue[]> {
  return db.syncQueue.toArray();
}

/**
 * Remove a sync operation after successful sync
 */
export async function removeSyncOp(id: string): Promise<void> {
  await db.syncQueue.delete(id);
}

/**
 * Update sync operation after failed attempt
 */
export async function markSyncAttempt(id: string, error: string): Promise<void> {
  const op = await db.syncQueue.get(id);
  if (op) {
    await db.syncQueue.update(id, {
      attempts: op.attempts + 1,
      lastAttemptAt: new Date().toISOString(),
      error
    });
  }
}

// ============================================================================
// Database Utilities
// ============================================================================

/**
 * Clear all data from the database
 */
export async function clearDatabase(): Promise<void> {
  await db.settings.clear();
  await db.projects.clear();
  await db.issues.clear();
  await db.vendors.clear();
  await db.documents.clear();
  await db.messages.clear();
  await db.threads.clear();
  await db.notifications.clear();
  await db.maintenanceTasks.clear();
  await db.payments.clear();
  await db.galleryImages.clear();
  await db.boms.clear();
  await db.models3d.clear();
  await db.syncQueue.clear();
}

/**
 * Export all data for backup
 */
export async function exportDatabase(): Promise<Record<string, unknown[]>> {
  return {
    settings: await db.settings.toArray(),
    projects: await db.projects.toArray(),
    issues: await db.issues.toArray(),
    vendors: await db.vendors.toArray(),
    documents: await db.documents.toArray(),
    messages: await db.messages.toArray(),
    threads: await db.threads.toArray(),
    notifications: await db.notifications.toArray(),
    maintenanceTasks: await db.maintenanceTasks.toArray(),
    payments: await db.payments.toArray(),
    galleryImages: await db.galleryImages.toArray(),
    boms: await db.boms.toArray(),
    models3d: await db.models3d.toArray()
  };
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<Record<string, number>> {
  return {
    settings: await db.settings.count(),
    projects: await db.projects.count(),
    issues: await db.issues.count(),
    vendors: await db.vendors.count(),
    documents: await db.documents.count(),
    messages: await db.messages.count(),
    threads: await db.threads.count(),
    notifications: await db.notifications.count(),
    maintenanceTasks: await db.maintenanceTasks.count(),
    payments: await db.payments.count(),
    galleryImages: await db.galleryImages.count(),
    boms: await db.boms.count(),
    models3d: await db.models3d.count(),
    syncQueue: await db.syncQueue.count()
  };
}

// Export default database instance
export default db;
