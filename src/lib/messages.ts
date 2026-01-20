import type { UserRole } from '../contexts/AuthContext';

// Message Types
export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: UserRole;
  senderName: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export interface Thread {
  id: string;
  participants: { id: string; role: UserRole; name: string }[];
  subject: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  category: 'general' | 'maintenance' | 'lease' | 'inspection';
}

// Inspection Types
export interface Inspection {
  id: string;
  title: string;
  description: string;
  proposedBy: { id: string; role: UserRole; name: string };
  proposedTimes: ProposedTime[];
  confirmedTime?: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: number;
}

export interface ProposedTime {
  id: string;
  time: number;
  proposedBy: { id: string; role: UserRole; name: string };
  votes: { id: string; role: UserRole }[];
}

// Satisfaction Types
export interface SatisfactionEntry {
  id: string;
  tenantId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
  category: 'overall' | 'maintenance' | 'communication' | 'amenities';
  timestamp: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'message' | 'inspection' | 'maintenance' | 'payment' | 'general';
  title: string;
  body: string;
  read: boolean;
  timestamp: number;
  link?: string;
}

// Storage Keys
const STORAGE_KEYS = {
  THREADS: 'pm_threads',
  MESSAGES: 'pm_messages',
  INSPECTIONS: 'pm_inspections',
  SATISFACTION: 'pm_satisfaction',
  NOTIFICATIONS: 'pm_notifications',
} as const;

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Thread Helpers
export function getThreads(): Thread[] {
  const data = localStorage.getItem(STORAGE_KEYS.THREADS);
  return data ? JSON.parse(data) : getDefaultThreads();
}

export function saveThreads(threads: Thread[]): void {
  localStorage.setItem(STORAGE_KEYS.THREADS, JSON.stringify(threads));
}

export function getThread(threadId: string): Thread | undefined {
  return getThreads().find(t => t.id === threadId);
}

export function createThread(thread: Omit<Thread, 'id'>): Thread {
  const threads = getThreads();
  const newThread: Thread = { ...thread, id: generateId() };
  threads.unshift(newThread);
  saveThreads(threads);
  return newThread;
}

export function updateThread(threadId: string, updates: Partial<Thread>): void {
  const threads = getThreads();
  const index = threads.findIndex(t => t.id === threadId);
  if (index !== -1) {
    threads[index] = { ...threads[index], ...updates };
    saveThreads(threads);
  }
}

// Message Helpers
export function getMessages(threadId: string): Message[] {
  const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  const allMessages: Message[] = data ? JSON.parse(data) : getDefaultMessages();
  return allMessages.filter(m => m.threadId === threadId).sort((a, b) => a.timestamp - b.timestamp);
}

export function getAllMessages(): Message[] {
  const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  return data ? JSON.parse(data) : getDefaultMessages();
}

export function saveMessages(messages: Message[]): void {
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
}

export function sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'read'>): Message {
  const allMessages = getAllMessages();
  const newMessage: Message = {
    ...message,
    id: generateId(),
    timestamp: Date.now(),
    read: false,
  };
  allMessages.push(newMessage);
  saveMessages(allMessages);

  // Update thread's last message
  updateThread(message.threadId, {
    lastMessage: message.content,
    lastMessageTime: newMessage.timestamp,
  });

  return newMessage;
}

export function markMessagesAsRead(threadId: string, userId: string): void {
  const allMessages = getAllMessages();
  const updated = allMessages.map(m =>
    m.threadId === threadId && m.senderId !== userId ? { ...m, read: true } : m
  );
  saveMessages(updated);

  // Reset thread unread count
  updateThread(threadId, { unreadCount: 0 });
}

// Inspection Helpers
export function getInspections(): Inspection[] {
  const data = localStorage.getItem(STORAGE_KEYS.INSPECTIONS);
  return data ? JSON.parse(data) : getDefaultInspections();
}

export function saveInspections(inspections: Inspection[]): void {
  localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(inspections));
}

export function createInspection(inspection: Omit<Inspection, 'id' | 'createdAt'>): Inspection {
  const inspections = getInspections();
  const newInspection: Inspection = {
    ...inspection,
    id: generateId(),
    createdAt: Date.now(),
  };
  inspections.unshift(newInspection);
  saveInspections(inspections);
  return newInspection;
}

export function updateInspection(id: string, updates: Partial<Inspection>): void {
  const inspections = getInspections();
  const index = inspections.findIndex(i => i.id === id);
  if (index !== -1) {
    inspections[index] = { ...inspections[index], ...updates };
    saveInspections(inspections);
  }
}

export function proposeTime(inspectionId: string, proposedTime: Omit<ProposedTime, 'id' | 'votes'>): void {
  const inspections = getInspections();
  const index = inspections.findIndex(i => i.id === inspectionId);
  if (index !== -1) {
    const newTime: ProposedTime = {
      ...proposedTime,
      id: generateId(),
      votes: [{ id: proposedTime.proposedBy.id, role: proposedTime.proposedBy.role }],
    };
    inspections[index].proposedTimes.push(newTime);
    saveInspections(inspections);
  }
}

export function voteForTime(inspectionId: string, timeId: string, voter: { id: string; role: UserRole }): void {
  const inspections = getInspections();
  const inspection = inspections.find(i => i.id === inspectionId);
  if (inspection) {
    const time = inspection.proposedTimes.find(t => t.id === timeId);
    if (time && !time.votes.find(v => v.id === voter.id)) {
      time.votes.push(voter);
      saveInspections(inspections);
    }
  }
}

// Satisfaction Helpers
export function getSatisfactionEntries(): SatisfactionEntry[] {
  const data = localStorage.getItem(STORAGE_KEYS.SATISFACTION);
  return data ? JSON.parse(data) : getDefaultSatisfaction();
}

export function saveSatisfactionEntries(entries: SatisfactionEntry[]): void {
  localStorage.setItem(STORAGE_KEYS.SATISFACTION, JSON.stringify(entries));
}

export function submitSatisfaction(entry: Omit<SatisfactionEntry, 'id' | 'timestamp'>): SatisfactionEntry {
  const entries = getSatisfactionEntries();
  const newEntry: SatisfactionEntry = {
    ...entry,
    id: generateId(),
    timestamp: Date.now(),
  };
  entries.unshift(newEntry);
  saveSatisfactionEntries(entries);
  return newEntry;
}

export function getAverageSatisfaction(): number {
  const entries = getSatisfactionEntries();
  if (entries.length === 0) return 0;
  const sum = entries.reduce((acc, e) => acc + e.rating, 0);
  return Math.round((sum / entries.length) * 10) / 10;
}

// Notification Helpers
export function getNotifications(): Notification[] {
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  return data ? JSON.parse(data) : getDefaultNotifications();
}

export function saveNotifications(notifications: Notification[]): void {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}

export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...notification,
    id: generateId(),
    timestamp: Date.now(),
    read: false,
  };
  notifications.unshift(newNotification);
  saveNotifications(notifications);
  return newNotification;
}

export function markNotificationAsRead(id: string): void {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications[index].read = true;
    saveNotifications(notifications);
  }
}

export function getUnreadCount(): number {
  return getNotifications().filter(n => !n.read).length;
}

export function getUnreadMessageCount(_userId: string): number {
  // userId reserved for future user-specific filtering
  const threads = getThreads();
  return threads.reduce((acc, t) => acc + t.unreadCount, 0);
}

// Default Data for Demo
function getDefaultThreads(): Thread[] {
  return [
    {
      id: 'thread-1',
      participants: [
        { id: 'pm-1', role: 'pm', name: 'Dan Connolly' },
        { id: 'tenant-1', role: 'tenant', name: 'Gregg Marshall' },
      ],
      subject: 'HVAC Filter Change',
      lastMessage: 'Maintenance will be entering on Tuesday between 10am-2pm to change filters.',
      lastMessageTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
      unreadCount: 1,
      category: 'maintenance',
    },
    {
      id: 'thread-2',
      participants: [
        { id: 'owner-1', role: 'owner', name: 'Shanie Holman' },
        { id: 'pm-1', role: 'pm', name: 'Dan Connolly' },
      ],
      subject: 'Monthly Property Update',
      lastMessage: 'All maintenance tasks are on schedule. Tenant payment received on time.',
      lastMessageTime: Date.now() - 5 * 24 * 60 * 60 * 1000,
      unreadCount: 0,
      category: 'general',
    },
    {
      id: 'thread-3',
      participants: [
        { id: 'owner-1', role: 'owner', name: 'Shanie Holman' },
        { id: 'pm-1', role: 'pm', name: 'Dan Connolly' },
        { id: 'tenant-1', role: 'tenant', name: 'Gregg Marshall' },
      ],
      subject: 'Upcoming Lease Renewal',
      lastMessage: 'The current lease expires in August. Let\'s discuss renewal terms.',
      lastMessageTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
      unreadCount: 2,
      category: 'lease',
    },
  ];
}

function getDefaultMessages(): Message[] {
  return [
    {
      id: 'msg-1',
      threadId: 'thread-1',
      senderId: 'pm-1',
      senderRole: 'pm',
      senderName: 'Dan Connolly',
      content: 'Hi Gregg, just wanted to let you know about the upcoming HVAC maintenance.',
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
      read: true,
    },
    {
      id: 'msg-2',
      threadId: 'thread-1',
      senderId: 'pm-1',
      senderRole: 'pm',
      senderName: 'Dan Connolly',
      content: 'Maintenance will be entering on Tuesday between 10am-2pm to change filters.',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      read: false,
    },
    {
      id: 'msg-3',
      threadId: 'thread-2',
      senderId: 'pm-1',
      senderRole: 'pm',
      senderName: 'Dan Connolly',
      content: 'Hi Shanie, here\'s your monthly property update.',
      timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
      read: true,
    },
    {
      id: 'msg-4',
      threadId: 'thread-2',
      senderId: 'pm-1',
      senderRole: 'pm',
      senderName: 'Dan Connolly',
      content: 'All maintenance tasks are on schedule. Tenant payment received on time.',
      timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
      read: true,
    },
    {
      id: 'msg-5',
      threadId: 'thread-3',
      senderId: 'pm-1',
      senderRole: 'pm',
      senderName: 'Dan Connolly',
      content: 'Hi everyone, I wanted to start a conversation about the lease renewal.',
      timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
      read: true,
    },
    {
      id: 'msg-6',
      threadId: 'thread-3',
      senderId: 'owner-1',
      senderRole: 'owner',
      senderName: 'Shanie Holman',
      content: 'Thanks Dan. I\'m open to discussing terms. What does Gregg think?',
      timestamp: Date.now() - 7.5 * 24 * 60 * 60 * 1000,
      read: true,
    },
    {
      id: 'msg-7',
      threadId: 'thread-3',
      senderId: 'pm-1',
      senderRole: 'pm',
      senderName: 'Dan Connolly',
      content: 'The current lease expires in August. Let\'s discuss renewal terms.',
      timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
      read: false,
    },
  ];
}

function getDefaultInspections(): Inspection[] {
  return [
    {
      id: 'insp-1',
      title: 'Quarterly Property Inspection',
      description: 'Routine inspection of all rooms, appliances, and safety systems.',
      proposedBy: { id: 'pm-1', role: 'pm', name: 'Dan Connolly' },
      proposedTimes: [
        {
          id: 'time-1',
          time: Date.now() + 7 * 24 * 60 * 60 * 1000,
          proposedBy: { id: 'pm-1', role: 'pm', name: 'Dan Connolly' },
          votes: [{ id: 'pm-1', role: 'pm' }],
        },
        {
          id: 'time-2',
          time: Date.now() + 8 * 24 * 60 * 60 * 1000,
          proposedBy: { id: 'pm-1', role: 'pm', name: 'Dan Connolly' },
          votes: [],
        },
      ],
      status: 'pending',
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    },
  ];
}

function getDefaultSatisfaction(): SatisfactionEntry[] {
  return [
    {
      id: 'sat-1',
      tenantId: 'tenant-1',
      rating: 4,
      feedback: 'Good communication from property manager. Quick response to maintenance requests.',
      category: 'overall',
      timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
    },
    {
      id: 'sat-2',
      tenantId: 'tenant-1',
      rating: 5,
      category: 'communication',
      timestamp: Date.now() - 60 * 24 * 60 * 60 * 1000,
    },
  ];
}

function getDefaultNotifications(): Notification[] {
  return [
    {
      id: 'notif-1',
      type: 'message',
      title: 'New Message',
      body: 'Dan Connolly sent a message about HVAC maintenance.',
      read: false,
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      link: '/messages?thread=thread-1',
    },
    {
      id: 'notif-2',
      type: 'inspection',
      title: 'Inspection Scheduled',
      body: 'Quarterly property inspection proposed for next week.',
      read: false,
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      link: '/messages?tab=inspections',
    },
    {
      id: 'notif-3',
      type: 'payment',
      title: 'Rent Payment Received',
      body: 'July rent payment of $2,400 has been received.',
      read: true,
      timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
    },
  ];
}

// Utility function to format relative time
export function formatRelativeTime(timestamp: number): string {
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

// Utility function to format date
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
