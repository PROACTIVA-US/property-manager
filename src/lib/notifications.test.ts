import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getNotifications,
  saveNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  markMessageNotificationAsRead,
  deleteNotification,
  getUnreadNotificationCount,
  getUnreadByType,
  aggregateNotifications,
  notifyPaymentReceived,
  notifyPaymentDue,
  notifyProjectAssigned,
  notifyStakeholders,
  getNotificationIcon,
  getNotificationColor,
  formatTimestamp,
  type Notification,
  type NotificationType,
  type NotificationPriority,
} from './notifications'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

// Mock the messages module
vi.mock('./messages', () => ({
  getThreads: vi.fn(() => []),
}))

// Mock the projects module
vi.mock('./projects', () => ({
  getProjects: vi.fn(() => []),
}))

describe('notifications.ts', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('getNotifications', () => {
    it('should return empty array when localStorage is empty', () => {
      const notifications = getNotifications()
      expect(notifications).toEqual([])
    })

    it('should return stored notifications sorted by timestamp (newest first)', () => {
      const now = Date.now()
      const testNotifications: Notification[] = [
        {
          id: 'n1',
          type: 'message',
          priority: 'normal',
          title: 'Older',
          body: 'Older notification',
          timestamp: now - 1000,
          read: false,
          archived: false,
        },
        {
          id: 'n2',
          type: 'message',
          priority: 'normal',
          title: 'Newer',
          body: 'Newer notification',
          timestamp: now,
          read: false,
          archived: false,
        },
      ]
      localStorageMock.setItem('pm_notifications', JSON.stringify(testNotifications))

      const notifications = getNotifications()
      expect(notifications).toHaveLength(2)
      expect(notifications[0].title).toBe('Newer')
      expect(notifications[1].title).toBe('Older')
    })
  })

  describe('saveNotifications', () => {
    it('should save notifications to localStorage', () => {
      const testNotifications: Notification[] = [
        {
          id: 'save-test',
          type: 'message',
          priority: 'normal',
          title: 'Test',
          body: 'Test body',
          timestamp: Date.now(),
          read: false,
          archived: false,
        },
      ]

      saveNotifications(testNotifications)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pm_notifications',
        JSON.stringify(testNotifications)
      )
    })
  })

  describe('createNotification', () => {
    it('should create a notification with generated ID', () => {
      const newNotification = createNotification({
        type: 'payment_received',
        priority: 'normal',
        title: 'Payment',
        body: 'Payment received',
        timestamp: Date.now(),
        read: false,
        archived: false,
      })

      expect(newNotification.id).toBeTruthy()
      expect(newNotification.title).toBe('Payment')

      const notifications = getNotifications()
      expect(notifications.find(n => n.id === newNotification.id)).toBeDefined()
    })

    it('should add new notification at the beginning of the list', () => {
      const existing: Notification[] = [
        {
          id: 'existing',
          type: 'message',
          priority: 'normal',
          title: 'Existing',
          body: 'Existing',
          timestamp: Date.now() - 1000,
          read: false,
          archived: false,
        },
      ]
      localStorageMock.setItem('pm_notifications', JSON.stringify(existing))

      createNotification({
        type: 'message',
        priority: 'high',
        title: 'New',
        body: 'New notification',
        timestamp: Date.now(),
        read: false,
        archived: false,
      })

      const notifications = getNotifications()
      expect(notifications[0].title).toBe('New')
    })
  })

  describe('markAsRead', () => {
    it('should mark a specific notification as read', () => {
      const testNotifications: Notification[] = [
        {
          id: 'mark-read',
          type: 'message',
          priority: 'normal',
          title: 'Unread',
          body: 'Body',
          timestamp: Date.now(),
          read: false,
          archived: false,
        },
      ]
      localStorageMock.setItem('pm_notifications', JSON.stringify(testNotifications))

      markAsRead('mark-read')

      const notifications = getNotifications()
      expect(notifications.find(n => n.id === 'mark-read')?.read).toBe(true)
    })

    it('should do nothing for non-existent notification', () => {
      localStorageMock.setItem('pm_notifications', JSON.stringify([]))
      markAsRead('non-existent')
      // Should not throw
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      const testNotifications: Notification[] = [
        {
          id: 'n1',
          type: 'message',
          priority: 'normal',
          title: 'N1',
          body: 'Body',
          timestamp: Date.now(),
          read: false,
          archived: false,
        },
        {
          id: 'n2',
          type: 'payment_due',
          priority: 'high',
          title: 'N2',
          body: 'Body',
          timestamp: Date.now(),
          read: false,
          archived: false,
        },
      ]
      localStorageMock.setItem('pm_notifications', JSON.stringify(testNotifications))

      markAllAsRead()

      const notifications = getNotifications()
      expect(notifications.every(n => n.read)).toBe(true)
    })
  })

  describe('archiveNotification', () => {
    it('should archive a specific notification', () => {
      const testNotifications: Notification[] = [
        {
          id: 'archive-me',
          type: 'message',
          priority: 'normal',
          title: 'Archive',
          body: 'Body',
          timestamp: Date.now(),
          read: true,
          archived: false,
        },
      ]
      localStorageMock.setItem('pm_notifications', JSON.stringify(testNotifications))

      archiveNotification('archive-me')

      const notifications = getNotifications()
      expect(notifications.find(n => n.id === 'archive-me')?.archived).toBe(true)
    })
  })

  describe('markMessageNotificationAsRead', () => {
    it('should mark message notifications for a specific thread as read', () => {
      const testNotifications: Notification[] = [
        {
          id: 'n1',
          type: 'message',
          priority: 'normal',
          title: 'Message 1',
          body: 'Body',
          timestamp: Date.now(),
          read: false,
          archived: false,
          metadata: { messageId: 'thread-123' },
        },
        {
          id: 'n2',
          type: 'message',
          priority: 'normal',
          title: 'Message 2',
          body: 'Body',
          timestamp: Date.now(),
          read: false,
          archived: false,
          metadata: { messageId: 'thread-456' },
        },
      ]
      localStorageMock.setItem('pm_notifications', JSON.stringify(testNotifications))

      markMessageNotificationAsRead('thread-123')

      const notifications = getNotifications()
      expect(notifications.find(n => n.id === 'n1')?.read).toBe(true)
      expect(notifications.find(n => n.id === 'n2')?.read).toBe(false)
    })
  })

  describe('deleteNotification', () => {
    it('should delete a notification', () => {
      const testNotifications: Notification[] = [
        {
          id: 'delete-me',
          type: 'message',
          priority: 'normal',
          title: 'Delete',
          body: 'Body',
          timestamp: Date.now(),
          read: false,
          archived: false,
        },
        {
          id: 'keep-me',
          type: 'message',
          priority: 'normal',
          title: 'Keep',
          body: 'Body',
          timestamp: Date.now(),
          read: false,
          archived: false,
        },
      ]
      localStorageMock.setItem('pm_notifications', JSON.stringify(testNotifications))

      deleteNotification('delete-me')

      const notifications = getNotifications()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].id).toBe('keep-me')
    })
  })

  describe('getUnreadNotificationCount', () => {
    it('should return count of unread non-archived notifications', () => {
      const testNotifications: Notification[] = [
        {
          id: 'n1',
          type: 'message',
          priority: 'normal',
          title: 'Unread',
          body: 'Body',
          timestamp: Date.now(),
          read: false,
          archived: false,
        },
        {
          id: 'n2',
          type: 'message',
          priority: 'normal',
          title: 'Read',
          body: 'Body',
          timestamp: Date.now(),
          read: true,
          archived: false,
        },
        {
          id: 'n3',
          type: 'message',
          priority: 'normal',
          title: 'Archived',
          body: 'Body',
          timestamp: Date.now(),
          read: false,
          archived: true,
        },
      ]
      localStorageMock.setItem('pm_notifications', JSON.stringify(testNotifications))

      const count = getUnreadNotificationCount()
      expect(count).toBe(1)
    })

    it('should return 0 when no unread notifications', () => {
      localStorageMock.setItem('pm_notifications', JSON.stringify([]))
      const count = getUnreadNotificationCount()
      expect(count).toBe(0)
    })
  })

  describe('getUnreadByType', () => {
    it('should return unread count for a specific type', () => {
      const testNotifications: Notification[] = [
        {
          id: 'n1',
          type: 'message',
          priority: 'normal',
          title: 'Message',
          body: 'Body',
          timestamp: Date.now(),
          read: false,
          archived: false,
        },
        {
          id: 'n2',
          type: 'payment_due',
          priority: 'urgent',
          title: 'Payment',
          body: 'Body',
          timestamp: Date.now(),
          read: false,
          archived: false,
        },
        {
          id: 'n3',
          type: 'message',
          priority: 'normal',
          title: 'Another Message',
          body: 'Body',
          timestamp: Date.now(),
          read: false,
          archived: false,
        },
      ]
      localStorageMock.setItem('pm_notifications', JSON.stringify(testNotifications))

      const messageCount = getUnreadByType('message')
      expect(messageCount).toBe(2)

      const paymentCount = getUnreadByType('payment_due')
      expect(paymentCount).toBe(1)
    })
  })

  describe('aggregateNotifications', () => {
    it('should return existing notifications when no new activity', async () => {
      const existing: Notification[] = [
        {
          id: 'existing',
          type: 'message',
          priority: 'normal',
          title: 'Existing',
          body: 'Body',
          timestamp: Date.now(),
          read: false,
          archived: false,
        },
      ]
      localStorageMock.setItem('pm_notifications', JSON.stringify(existing))

      // Mock returns empty arrays
      const { getThreads } = await import('./messages')
      const { getProjects } = await import('./projects')
      vi.mocked(getThreads).mockReturnValue([])
      vi.mocked(getProjects).mockReturnValue([])

      const notifications = aggregateNotifications('pm')
      expect(notifications).toHaveLength(1)
      expect(notifications[0].id).toBe('existing')
    })

    it('should create notifications for threads with unread messages', async () => {
      localStorageMock.setItem('pm_notifications', JSON.stringify([]))

      const { getThreads } = await import('./messages')
      vi.mocked(getThreads).mockReturnValue([
        {
          id: 'thread-with-unread',
          participants: [],
          subject: 'Unread Thread',
          lastMessage: 'Hello',
          lastMessageTime: Date.now(),
          unreadCount: 2,
          category: 'general',
        },
      ])

      const { getProjects } = await import('./projects')
      vi.mocked(getProjects).mockReturnValue([])

      const notifications = aggregateNotifications('pm')
      expect(notifications.length).toBeGreaterThanOrEqual(1)
      expect(notifications.some(n => n.type === 'message')).toBe(true)
    })
  })

  describe('notifyPaymentReceived', () => {
    it('should create a payment received notification', () => {
      localStorageMock.setItem('pm_notifications', JSON.stringify([]))

      notifyPaymentReceived({
        id: 'payment-1',
        amount: 1500,
        paidBy: 'John Doe',
        date: '2026-01-15',
      })

      const notifications = getNotifications()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe('payment_received')
      expect(notifications[0].body).toContain('$1500.00')
      expect(notifications[0].body).toContain('John Doe')
    })
  })

  describe('notifyPaymentDue', () => {
    it('should create an urgent notification when payment is due soon', () => {
      localStorageMock.setItem('pm_notifications', JSON.stringify([]))

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      notifyPaymentDue(2000, tomorrow.toISOString().split('T')[0])

      const notifications = getNotifications()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe('payment_due')
      expect(notifications[0].priority).toBe('urgent')
      expect(notifications[0].body).toContain('$2000.00')
    })

    it('should create a normal priority notification when payment is not due soon', () => {
      localStorageMock.setItem('pm_notifications', JSON.stringify([]))

      const inTwoWeeks = new Date()
      inTwoWeeks.setDate(inTwoWeeks.getDate() + 14)

      notifyPaymentDue(2000, inTwoWeeks.toISOString().split('T')[0])

      const notifications = getNotifications()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].priority).toBe('normal')
    })
  })

  describe('notifyProjectAssigned', () => {
    it('should create a project assignment notification', () => {
      localStorageMock.setItem('pm_notifications', JSON.stringify([]))

      notifyProjectAssigned('Kitchen Renovation', 'project-123', 'user-456')

      const notifications = getNotifications()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe('project_assigned')
      expect(notifications[0].body).toContain('Kitchen Renovation')
      expect(notifications[0].link).toBe('/projects/project-123')
    })
  })

  describe('notifyStakeholders', () => {
    it('should create notifications for each stakeholder', () => {
      localStorageMock.setItem('pm_notifications', JSON.stringify([]))

      notifyStakeholders({
        type: 'project_created',
        itemTitle: 'New Project',
        itemId: 'project-1',
        link: '/projects/project-1',
        stakeholders: ['pm', 'tenant'],
      })

      const notifications = getNotifications()
      expect(notifications).toHaveLength(2)
      expect(notifications.every(n => n.body.includes('New Project'))).toBe(true)
    })

    it('should add "(Owner action)" suffix for PM notifications', () => {
      localStorageMock.setItem('pm_notifications', JSON.stringify([]))

      notifyStakeholders({
        type: 'project_updated',
        itemTitle: 'Updated Project',
        itemId: 'project-1',
        link: '/projects/project-1',
        stakeholders: ['pm'],
      })

      const notifications = getNotifications()
      expect(notifications[0].body).toContain('(Owner action)')
    })
  })

  describe('getNotificationIcon', () => {
    it('should return correct icons for each type', () => {
      const typeIconMap: Record<NotificationType, string> = {
        message: '💬',
        project_status: '📋',
        project_assigned: '👤',
        maintenance: '🔧',
        payment_received: '💰',
        payment_due: '💳',
        inspection: '🔍',
        responsibility: '✅',
        general: 'ℹ️',
      }

      Object.entries(typeIconMap).forEach(([type, expectedIcon]) => {
        expect(getNotificationIcon(type as NotificationType)).toBe(expectedIcon)
      })
    })
  })

  describe('getNotificationColor', () => {
    it('should return correct colors for each priority', () => {
      const priorityColorMap: Record<NotificationPriority, string> = {
        low: 'text-gray-600',
        normal: 'text-blue-600',
        high: 'text-orange-600',
        urgent: 'text-red-600',
      }

      Object.entries(priorityColorMap).forEach(([priority, expectedColor]) => {
        expect(getNotificationColor(priority as NotificationPriority)).toBe(expectedColor)
      })
    })
  })

  describe('formatTimestamp', () => {
    it('should return "Just now" for very recent timestamps', () => {
      const result = formatTimestamp(Date.now())
      expect(result).toBe('Just now')
    })

    it('should return minutes ago for timestamps within an hour', () => {
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000
      const result = formatTimestamp(tenMinutesAgo)
      expect(result).toBe('10m ago')
    })

    it('should return hours ago for timestamps within a day', () => {
      const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000
      const result = formatTimestamp(threeHoursAgo)
      expect(result).toBe('3h ago')
    })

    it('should return days ago for timestamps within a week', () => {
      const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000
      const result = formatTimestamp(fiveDaysAgo)
      expect(result).toBe('5d ago')
    })

    it('should return formatted date for older timestamps', () => {
      const threeWeeksAgo = Date.now() - 21 * 24 * 60 * 60 * 1000
      const result = formatTimestamp(threeWeeksAgo)
      expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
    })
  })
})
