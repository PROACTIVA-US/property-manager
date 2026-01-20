import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Calendar,
  Star,
  Bell,
  Plus,
  Search,
  Filter,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MessageThread from '../components/MessageThread';
import { MessageComposer, NewThreadComposer } from '../components/MessageComposer';
import InspectionScheduler from '../components/InspectionScheduler';
import SatisfactionSurvey from '../components/SatisfactionSurvey';
import {
  getThreads,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  createThread,
  getInspections,
  createInspection,
  proposeTime,
  voteForTime,
  updateInspection,
  getSatisfactionEntries,
  submitSatisfaction,
  getAverageSatisfaction,
  getNotifications,
  markNotificationAsRead,
  formatRelativeTime,
  type Thread,
  type Inspection,
  type SatisfactionEntry,
  type Notification,
} from '../lib/messages';
import { cn } from '../lib/utils';
import type { UserRole } from '../contexts/AuthContext';

type TabType = 'messages' | 'inspections' | 'satisfaction' | 'notifications';

// Available participants for new threads (mock data matching auth context)
const ALL_PARTICIPANTS = [
  { id: 'owner-1', role: 'owner' as UserRole, name: 'Shanie Holman' },
  { id: 'pm-1', role: 'pm' as UserRole, name: 'Dan Connolly' },
  { id: 'tenant-1', role: 'tenant' as UserRole, name: 'Gregg Marshall' },
];

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [activeTab, setActiveTab] = useState<TabType>(
    (searchParams.get('tab') as TabType) || 'messages'
  );
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    searchParams.get('thread')
  );
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [satisfactionEntries, setSatisfactionEntries] = useState<SatisfactionEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNewThread, setShowNewThread] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Thread['category'] | 'all'>('all');

  // Current user info
  const currentUser = {
    id: user?.role === 'owner' ? 'owner-1' : user?.role === 'pm' ? 'pm-1' : 'tenant-1',
    role: user?.role || null,
    name: user?.displayName || 'User',
  };

  // Load data
  const loadData = useCallback(() => {
    setThreads(getThreads());
    setInspections(getInspections());
    setSatisfactionEntries(getSatisfactionEntries());
    setNotifications(getNotifications());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== 'messages') params.set('tab', activeTab);
    if (selectedThreadId) params.set('thread', selectedThreadId);
    setSearchParams(params, { replace: true });
  }, [activeTab, selectedThreadId, setSearchParams]);

  // Selected thread data
  const selectedThread = threads.find(t => t.id === selectedThreadId);
  const threadMessages = selectedThreadId ? getMessages(selectedThreadId) : [];

  // Filter threads
  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || thread.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handlers
  const handleSendMessage = (content: string) => {
    if (selectedThreadId && user) {
      sendMessage({
        threadId: selectedThreadId,
        senderId: currentUser.id,
        senderRole: user.role,
        senderName: user.displayName,
        content,
      });
      loadData();
    }
  };

  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    markMessagesAsRead(threadId, currentUser.id);
    loadData();
  };

  const handleCreateThread = (data: {
    subject: string;
    category: Thread['category'];
    participants: { id: string; role: UserRole; name: string }[];
    initialMessage: string;
  }) => {
    const newThread = createThread({
      subject: data.subject,
      category: data.category,
      participants: data.participants,
      lastMessage: data.initialMessage,
      lastMessageTime: Date.now(),
      unreadCount: 0,
    });

    sendMessage({
      threadId: newThread.id,
      senderId: currentUser.id,
      senderRole: user?.role || null,
      senderName: user?.displayName || 'User',
      content: data.initialMessage,
    });

    loadData();
    setSelectedThreadId(newThread.id);
    setShowNewThread(false);
  };

  const handleCreateInspection = (inspection: Omit<Inspection, 'id' | 'createdAt'>) => {
    createInspection(inspection);
    loadData();
  };

  const handleProposeTime = (inspectionId: string, time: number) => {
    proposeTime(inspectionId, {
      time,
      proposedBy: currentUser,
    });
    loadData();
  };

  const handleVoteForTime = (inspectionId: string, timeId: string) => {
    voteForTime(inspectionId, timeId, { id: currentUser.id, role: user?.role || null });
    loadData();
  };

  const handleConfirmTime = (inspectionId: string, timeId: string) => {
    const inspection = inspections.find(i => i.id === inspectionId);
    const time = inspection?.proposedTimes.find(t => t.id === timeId);
    if (time) {
      updateInspection(inspectionId, {
        status: 'confirmed',
        confirmedTime: time.time,
      });
      loadData();
    }
  };

  const handleSubmitSatisfaction = (entry: Omit<SatisfactionEntry, 'id' | 'timestamp'>) => {
    submitSatisfaction(entry);
    loadData();
  };

  const handleMarkNotificationRead = (id: string) => {
    markNotificationAsRead(id);
    loadData();
  };

  // Counts for tab badges
  const unreadMessages = threads.reduce((acc, t) => acc + t.unreadCount, 0);
  const pendingInspections = inspections.filter(i => i.status === 'pending').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Other participants for new thread
  const availableParticipants = ALL_PARTICIPANTS.filter(p => p.id !== currentUser.id);

  const tabs = [
    { id: 'messages' as TabType, label: 'Messages', icon: MessageSquare, count: unreadMessages },
    { id: 'inspections' as TabType, label: 'Inspections', icon: Calendar, count: pendingInspections },
    { id: 'satisfaction' as TabType, label: 'Satisfaction', icon: Star, count: 0 },
    { id: 'notifications' as TabType, label: 'Activity', icon: Bell, count: unreadNotifications },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-light">Communication Hub</h1>
          <p className="text-brand-muted">Messages, scheduling, and feedback</p>
        </div>
        {activeTab === 'messages' && (
          <button
            onClick={() => setShowNewThread(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            New Conversation
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedThreadId(null);
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-brand-navy/50 text-brand-orange border-b-2 border-brand-orange'
                : 'text-brand-muted hover:text-brand-light hover:bg-slate-700/30'
            )}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.count > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-orange text-white">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Thread List */}
            <div className={cn('lg:col-span-1 space-y-4', selectedThreadId && 'hidden lg:block')}>
              {/* Search and Filter */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full input-field pl-10"
                  />
                </div>
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as Thread['category'] | 'all')}
                    className="input-field appearance-none pr-8 cursor-pointer"
                  >
                    <option value="all">All</option>
                    <option value="general">General</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="lease">Lease</option>
                    <option value="inspection">Inspection</option>
                  </select>
                  <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                </div>
              </div>

              {/* Thread Items */}
              <div className="space-y-2">
                {filteredThreads.length === 0 ? (
                  <div className="text-center py-12 text-brand-muted">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No conversations found</p>
                    <button
                      onClick={() => setShowNewThread(true)}
                      className="text-brand-orange hover:underline mt-2"
                    >
                      Start a new conversation
                    </button>
                  </div>
                ) : (
                  filteredThreads.map((thread) => (
                    <ThreadItem
                      key={thread.id}
                      thread={thread}
                      isSelected={thread.id === selectedThreadId}
                      onClick={() => handleSelectThread(thread.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Thread Detail / Messages */}
            <div className={cn(
              'lg:col-span-2 card p-0 overflow-hidden flex flex-col',
              !selectedThreadId && 'hidden lg:flex'
            )}>
              {selectedThread ? (
                <>
                  <MessageThread
                    thread={selectedThread}
                    messages={threadMessages}
                    currentUserId={currentUser.id}
                    currentUserRole={user?.role || null}
                    onBack={() => setSelectedThreadId(null)}
                  />
                  <MessageComposer onSend={handleSendMessage} />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-brand-muted">
                  <div className="text-center">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to view messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inspections Tab */}
        {activeTab === 'inspections' && (
          <InspectionScheduler
            inspections={inspections}
            currentUser={currentUser}
            onCreateInspection={handleCreateInspection}
            onProposeTime={handleProposeTime}
            onVoteForTime={handleVoteForTime}
            onConfirmTime={handleConfirmTime}
          />
        )}

        {/* Satisfaction Tab */}
        {activeTab === 'satisfaction' && (
          <SatisfactionSurvey
            entries={satisfactionEntries}
            averageRating={getAverageSatisfaction()}
            currentTenantId={currentUser.id}
            onSubmit={handleSubmitSatisfaction}
            isReadOnly={user?.role !== 'tenant'}
          />
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <NotificationsList
            notifications={notifications}
            onMarkRead={handleMarkNotificationRead}
          />
        )}
      </div>

      {/* New Thread Modal */}
      {showNewThread && (
        <NewThreadComposer
          onClose={() => setShowNewThread(false)}
          onCreate={handleCreateThread}
          currentUser={currentUser}
          availableParticipants={availableParticipants}
        />
      )}
    </div>
  );
}

// Thread List Item Component
interface ThreadItemProps {
  thread: Thread;
  isSelected: boolean;
  onClick: () => void;
}

function ThreadItem({ thread, isSelected, onClick }: ThreadItemProps) {
  const getCategoryColor = (category: Thread['category']) => {
    const colors = {
      general: 'bg-slate-600/50',
      maintenance: 'bg-yellow-500/20',
      lease: 'bg-purple-500/20',
      inspection: 'bg-green-500/20',
    };
    return colors[category] || colors.general;
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg cursor-pointer transition-all border',
        isSelected
          ? 'bg-brand-navy border-brand-orange/50'
          : 'bg-brand-navy/30 border-slate-700/50 hover:bg-brand-navy/50'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-brand-light truncate flex-1">{thread.subject}</h3>
        {thread.unreadCount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-orange text-white">
            {thread.unreadCount}
          </span>
        )}
      </div>
      <p className="text-sm text-brand-muted line-clamp-1 mb-2">{thread.lastMessage}</p>
      <div className="flex items-center justify-between text-xs">
        <span className={cn('px-2 py-0.5 rounded-full capitalize', getCategoryColor(thread.category))}>
          {thread.category}
        </span>
        <span className="text-brand-muted">{formatRelativeTime(thread.lastMessageTime)}</span>
      </div>
    </div>
  );
}

// Notifications List Component
interface NotificationsListProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

function NotificationsList({ notifications, onMarkRead }: NotificationsListProps) {
  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare size={20} className="text-blue-400" />;
      case 'inspection':
        return <Calendar size={20} className="text-green-400" />;
      case 'payment':
        return <Star size={20} className="text-yellow-400" />;
      default:
        return <Bell size={20} className="text-brand-muted" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-light">Recent Activity</h2>
        <span className="text-sm text-brand-muted">
          {notifications.filter(n => !n.read).length} unread
        </span>
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-brand-muted">
            <Bell size={48} className="mx-auto mb-4 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.read && onMarkRead(notification.id)}
              className={cn(
                'p-4 rounded-lg border transition-colors',
                notification.read
                  ? 'bg-brand-navy/30 border-slate-700/50'
                  : 'bg-brand-navy/50 border-brand-orange/30 cursor-pointer hover:bg-brand-navy/70'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-brand-dark/50 rounded-lg">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      'font-medium truncate',
                      notification.read ? 'text-brand-muted' : 'text-brand-light'
                    )}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-brand-orange flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-brand-muted mt-1">{notification.body}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {formatRelativeTime(notification.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
