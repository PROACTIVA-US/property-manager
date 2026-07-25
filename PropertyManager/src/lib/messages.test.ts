import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getAllMessages,
  getMessages,
  sendMessage,
  deleteMessage,
  getThreads,
  saveThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
  markMessagesAsRead,
  getUnreadMessageCount,
  getUnreadNotificationCount,
  generateId,
  formatRelativeTime,
  formatDate,
  type Message,
  type Thread,
} from './messages'

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

// Mock the notifications module to avoid circular dependency issues
vi.mock('./notifications', () => ({
  markMessageNotificationAsRead: vi.fn(),
}))

describe('messages.ts', () => {
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

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).toBeTruthy()
      expect(id2).toBeTruthy()
      expect(id1).not.toBe(id2)
    })

    it('should generate IDs with expected format', () => {
      const id = generateId()
      expect(id).toMatch(/^\d+-[a-z0-9]+$/)
    })
  })

  describe('Thread operations', () => {
    describe('getThreads', () => {
      it('should return default threads when localStorage is empty', () => {
        const threads = getThreads()
        expect(Array.isArray(threads)).toBe(true)
        expect(threads.length).toBeGreaterThan(0)
      })

      it('should return stored threads from localStorage', () => {
        const testThreads: Thread[] = [
          {
            id: 'test-thread-1',
            participants: [{ id: 'pm-1', role: 'pm', name: 'Test PM' }],
            subject: 'Test Subject',
            lastMessage: 'Test message',
            lastMessageTime: Date.now(),
            unreadCount: 0,
            category: 'general',
          },
        ]
        localStorageMock.setItem('pm_threads', JSON.stringify(testThreads))

        const threads = getThreads()
        expect(threads).toHaveLength(1)
        expect(threads[0].id).toBe('test-thread-1')
        expect(threads[0].subject).toBe('Test Subject')
      })
    })

    describe('saveThreads', () => {
      it('should save threads to localStorage', () => {
        const testThreads: Thread[] = [
          {
            id: 'save-test',
            participants: [],
            subject: 'Save Test',
            lastMessage: '',
            lastMessageTime: Date.now(),
            unreadCount: 0,
            category: 'general',
          },
        ]

        saveThreads(testThreads)

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'pm_threads',
          JSON.stringify(testThreads)
        )
      })
    })

    describe('getThread', () => {
      it('should return a specific thread by ID', () => {
        const testThreads: Thread[] = [
          {
            id: 'thread-find-1',
            participants: [],
            subject: 'Thread 1',
            lastMessage: '',
            lastMessageTime: Date.now(),
            unreadCount: 0,
            category: 'general',
          },
          {
            id: 'thread-find-2',
            participants: [],
            subject: 'Thread 2',
            lastMessage: '',
            lastMessageTime: Date.now(),
            unreadCount: 0,
            category: 'maintenance',
          },
        ]
        localStorageMock.setItem('pm_threads', JSON.stringify(testThreads))

        const thread = getThread('thread-find-2')
        expect(thread).toBeDefined()
        expect(thread?.subject).toBe('Thread 2')
      })

      it('should return undefined for non-existent thread', () => {
        const thread = getThread('non-existent-id')
        expect(thread).toBeUndefined()
      })
    })

    describe('createThread', () => {
      it('should create a new thread with generated ID', () => {
        const newThread = createThread({
          participants: [{ id: 'pm-1', role: 'pm', name: 'Test PM' }],
          subject: 'New Thread',
          lastMessage: 'First message',
          lastMessageTime: Date.now(),
          unreadCount: 1,
          category: 'lease',
        })

        expect(newThread.id).toBeTruthy()
        expect(newThread.subject).toBe('New Thread')
        expect(newThread.category).toBe('lease')

        // Verify it was saved
        const threads = getThreads()
        expect(threads.find(t => t.id === newThread.id)).toBeDefined()
      })
    })

    describe('updateThread', () => {
      it('should update an existing thread', () => {
        const testThreads: Thread[] = [
          {
            id: 'update-thread',
            participants: [],
            subject: 'Original Subject',
            lastMessage: 'Original message',
            lastMessageTime: Date.now(),
            unreadCount: 0,
            category: 'general',
          },
        ]
        localStorageMock.setItem('pm_threads', JSON.stringify(testThreads))

        updateThread('update-thread', { subject: 'Updated Subject', unreadCount: 5 })

        const thread = getThread('update-thread')
        expect(thread?.subject).toBe('Updated Subject')
        expect(thread?.unreadCount).toBe(5)
      })

      it('should do nothing for non-existent thread', () => {
        updateThread('non-existent', { subject: 'Test' })
        // Should not throw
      })
    })

    describe('deleteThread', () => {
      it('should delete a thread and its messages', () => {
        const testThreads: Thread[] = [
          {
            id: 'delete-thread',
            participants: [],
            subject: 'To Delete',
            lastMessage: '',
            lastMessageTime: Date.now(),
            unreadCount: 0,
            category: 'general',
          },
        ]
        const testMessages: Message[] = [
          {
            id: 'msg-in-thread',
            threadId: 'delete-thread',
            senderId: 'pm-1',
            senderRole: 'pm',
            senderName: 'Test PM',
            content: 'Test',
            timestamp: Date.now(),
            read: false,
          },
        ]
        localStorageMock.setItem('pm_threads', JSON.stringify(testThreads))
        localStorageMock.setItem('pm_messages', JSON.stringify(testMessages))

        deleteThread('delete-thread')

        const threads = getThreads()
        expect(threads.find(t => t.id === 'delete-thread')).toBeUndefined()

        const messages = getAllMessages()
        expect(messages.find(m => m.threadId === 'delete-thread')).toBeUndefined()
      })
    })
  })

  describe('Message operations', () => {
    describe('getAllMessages', () => {
      it('should return default messages when localStorage is empty', () => {
        const messages = getAllMessages()
        expect(Array.isArray(messages)).toBe(true)
      })

      it('should return stored messages from localStorage', () => {
        const testMessages: Message[] = [
          {
            id: 'test-msg-1',
            threadId: 'thread-1',
            senderId: 'pm-1',
            senderRole: 'pm',
            senderName: 'Test PM',
            content: 'Test content',
            timestamp: Date.now(),
            read: false,
          },
        ]
        localStorageMock.setItem('pm_messages', JSON.stringify(testMessages))

        const messages = getAllMessages()
        expect(messages).toHaveLength(1)
        expect(messages[0].content).toBe('Test content')
      })
    })

    describe('getMessages', () => {
      it('should return messages for a specific thread sorted by timestamp', () => {
        const now = Date.now()
        const testMessages: Message[] = [
          {
            id: 'msg-1',
            threadId: 'thread-1',
            senderId: 'pm-1',
            senderRole: 'pm',
            senderName: 'Test PM',
            content: 'Second',
            timestamp: now,
            read: false,
          },
          {
            id: 'msg-2',
            threadId: 'thread-1',
            senderId: 'pm-1',
            senderRole: 'pm',
            senderName: 'Test PM',
            content: 'First',
            timestamp: now - 1000,
            read: false,
          },
          {
            id: 'msg-3',
            threadId: 'thread-2',
            senderId: 'pm-1',
            senderRole: 'pm',
            senderName: 'Test PM',
            content: 'Other thread',
            timestamp: now,
            read: false,
          },
        ]
        localStorageMock.setItem('pm_messages', JSON.stringify(testMessages))

        const messages = getMessages('thread-1')
        expect(messages).toHaveLength(2)
        expect(messages[0].content).toBe('First')
        expect(messages[1].content).toBe('Second')
      })
    })

    describe('sendMessage', () => {
      it('should create a new message with generated ID and timestamp', () => {
        // Setup a thread first
        const testThreads: Thread[] = [
          {
            id: 'send-thread',
            participants: [],
            subject: 'Test',
            lastMessage: '',
            lastMessageTime: Date.now() - 10000,
            unreadCount: 0,
            category: 'general',
          },
        ]
        localStorageMock.setItem('pm_threads', JSON.stringify(testThreads))
        localStorageMock.setItem('pm_messages', JSON.stringify([]))

        const newMessage = sendMessage({
          threadId: 'send-thread',
          senderId: 'pm-1',
          senderRole: 'pm',
          senderName: 'Test PM',
          content: 'Hello world',
        })

        expect(newMessage.id).toBeTruthy()
        expect(newMessage.timestamp).toBeTruthy()
        expect(newMessage.read).toBe(false)
        expect(newMessage.content).toBe('Hello world')

        // Verify thread was updated
        const thread = getThread('send-thread')
        expect(thread?.lastMessage).toBe('Hello world')
      })
    })

    describe('deleteMessage', () => {
      it('should delete a message and return true', () => {
        const testMessages: Message[] = [
          {
            id: 'delete-msg',
            threadId: 'thread-1',
            senderId: 'pm-1',
            senderRole: 'pm',
            senderName: 'Test PM',
            content: 'To delete',
            timestamp: Date.now(),
            read: false,
          },
        ]
        localStorageMock.setItem('pm_messages', JSON.stringify(testMessages))
        localStorageMock.setItem('pm_threads', JSON.stringify([
          {
            id: 'thread-1',
            participants: [],
            subject: 'Test',
            lastMessage: 'To delete',
            lastMessageTime: Date.now(),
            unreadCount: 0,
            category: 'general',
          },
        ]))

        const result = deleteMessage('delete-msg')
        expect(result).toBe(true)

        const messages = getAllMessages()
        expect(messages.find(m => m.id === 'delete-msg')).toBeUndefined()
      })

      it('should return false for non-existent message', () => {
        localStorageMock.setItem('pm_messages', JSON.stringify([]))
        const result = deleteMessage('non-existent')
        expect(result).toBe(false)
      })

      it('should update thread last message when deleting latest message', () => {
        const now = Date.now()
        const testMessages: Message[] = [
          {
            id: 'older-msg',
            threadId: 'thread-1',
            senderId: 'pm-1',
            senderRole: 'pm',
            senderName: 'Test PM',
            content: 'Older message',
            timestamp: now - 1000,
            read: true,
          },
          {
            id: 'newer-msg',
            threadId: 'thread-1',
            senderId: 'pm-1',
            senderRole: 'pm',
            senderName: 'Test PM',
            content: 'Newer message',
            timestamp: now,
            read: false,
          },
        ]
        const testThreads: Thread[] = [
          {
            id: 'thread-1',
            participants: [],
            subject: 'Test',
            lastMessage: 'Newer message',
            lastMessageTime: now,
            unreadCount: 1,
            category: 'general',
          },
        ]
        localStorageMock.setItem('pm_messages', JSON.stringify(testMessages))
        localStorageMock.setItem('pm_threads', JSON.stringify(testThreads))

        deleteMessage('newer-msg')

        const thread = getThread('thread-1')
        expect(thread?.lastMessage).toBe('Older message')
      })
    })

    describe('markMessagesAsRead', () => {
      it('should mark messages as read for a specific user', () => {
        const testMessages: Message[] = [
          {
            id: 'msg-1',
            threadId: 'thread-1',
            senderId: 'other-user',
            senderRole: 'tenant',
            senderName: 'Tenant',
            content: 'Hello',
            timestamp: Date.now(),
            read: false,
          },
          {
            id: 'msg-2',
            threadId: 'thread-1',
            senderId: 'pm-1',
            senderRole: 'pm',
            senderName: 'PM',
            content: 'My message',
            timestamp: Date.now(),
            read: false,
          },
        ]
        const testThreads: Thread[] = [
          {
            id: 'thread-1',
            participants: [],
            subject: 'Test',
            lastMessage: '',
            lastMessageTime: Date.now(),
            unreadCount: 1,
            category: 'general',
          },
        ]
        localStorageMock.setItem('pm_messages', JSON.stringify(testMessages))
        localStorageMock.setItem('pm_threads', JSON.stringify(testThreads))

        markMessagesAsRead('thread-1', 'pm-1')

        const messages = getAllMessages()
        // Message from other user should be marked as read
        expect(messages.find(m => m.id === 'msg-1')?.read).toBe(true)
        // Message from the user should not change (they don't read their own messages)
        expect(messages.find(m => m.id === 'msg-2')?.read).toBe(false)

        // Thread unread count should be reset
        const thread = getThread('thread-1')
        expect(thread?.unreadCount).toBe(0)
      })
    })
  })

  describe('Count operations', () => {
    describe('getUnreadMessageCount', () => {
      it('should return total unread count across all threads', () => {
        const testThreads: Thread[] = [
          {
            id: 'thread-1',
            participants: [],
            subject: 'Thread 1',
            lastMessage: '',
            lastMessageTime: Date.now(),
            unreadCount: 3,
            category: 'general',
          },
          {
            id: 'thread-2',
            participants: [],
            subject: 'Thread 2',
            lastMessage: '',
            lastMessageTime: Date.now(),
            unreadCount: 2,
            category: 'general',
          },
        ]
        localStorageMock.setItem('pm_threads', JSON.stringify(testThreads))

        const count = getUnreadMessageCount('any-user')
        expect(count).toBe(5)
      })

      it('should return 0 when no unread messages', () => {
        const testThreads: Thread[] = [
          {
            id: 'thread-1',
            participants: [],
            subject: 'Thread 1',
            lastMessage: '',
            lastMessageTime: Date.now(),
            unreadCount: 0,
            category: 'general',
          },
        ]
        localStorageMock.setItem('pm_threads', JSON.stringify(testThreads))

        const count = getUnreadMessageCount('any-user')
        expect(count).toBe(0)
      })
    })

    describe('getUnreadNotificationCount', () => {
      it('should return count of unread notifications', () => {
        const testNotifications = [
          { id: 'n1', read: false },
          { id: 'n2', read: true },
          { id: 'n3', read: false },
        ]
        localStorageMock.setItem('pm_notifications', JSON.stringify(testNotifications))

        const count = getUnreadNotificationCount()
        expect(count).toBe(2)
      })
    })
  })

  describe('Utility functions', () => {
    describe('formatRelativeTime', () => {
      it('should return "Just now" for very recent timestamps', () => {
        const result = formatRelativeTime(Date.now())
        expect(result).toBe('Just now')
      })

      it('should return minutes ago for timestamps within an hour', () => {
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
        const result = formatRelativeTime(fiveMinutesAgo)
        expect(result).toBe('5m ago')
      })

      it('should return hours ago for timestamps within a day', () => {
        const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000
        const result = formatRelativeTime(twoHoursAgo)
        expect(result).toBe('2h ago')
      })

      it('should return days ago for timestamps within a week', () => {
        const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000
        const result = formatRelativeTime(threeDaysAgo)
        expect(result).toBe('3d ago')
      })

      it('should return formatted date for older timestamps', () => {
        const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000
        const result = formatRelativeTime(twoWeeksAgo)
        expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
      })
    })

    describe('formatDate', () => {
      it('should format date with weekday, month, day and time', () => {
        // Use a fixed date: January 15, 2026, 2:30 PM
        const date = new Date(2026, 0, 15, 14, 30)
        const result = formatDate(date.getTime())

        // Result should contain Thu, Jan, 15, 2:30
        expect(result).toContain('Thu')
        expect(result).toContain('Jan')
        expect(result).toContain('15')
        expect(result).toContain('2:30')
      })
    })
  })
})
