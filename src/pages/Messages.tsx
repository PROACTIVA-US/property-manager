import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MessageThread from '../components/MessageThread';
import { MessageComposer, NewThreadComposer } from '../components/MessageComposer';
import {
  getThreadsAsync,
  getMessagesAsync,
  sendMessageAsync,
  markMessagesAsReadAsync,
  createThreadAsync,
  deleteMessageAsync,
  deleteThreadAsync,
  formatRelativeTime,
  type Thread,
  type Message,
} from '../lib/messages';
import { cn } from '../lib/utils';
import type { UserRole } from '../contexts/AuthContext';
import { loadSettings } from '../lib/settings';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Get real names from settings
const getParticipants = () => {
  const settings = loadSettings();
  return [
    { id: 'owner-1', role: 'owner' as UserRole, name: settings.owner.name },
    { id: 'pm-1', role: 'pm' as UserRole, name: settings.pm.name },
    { id: 'tenant-1', role: 'tenant' as UserRole, name: settings.tenant.name },
  ];
};

const ALL_PARTICIPANTS = getParticipants();

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    searchParams.get('thread')
  );
  const [showNewThread, setShowNewThread] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Thread['category'] | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Current user info
  const currentUser = {
    id: user?.role === 'owner' ? 'owner-1' : user?.role === 'pm' ? 'pm-1' : 'tenant-1',
    role: user?.role || null,
    name: user?.displayName || 'User',
  };

  // Load data callback for refreshing
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getThreadsAsync();
      setThreads(data);
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load messages when thread is selected
  useEffect(() => {
    if (selectedThreadId) {
      getMessagesAsync(selectedThreadId).then(setThreadMessages);
    } else {
      setThreadMessages([]);
    }
  }, [selectedThreadId]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedThreadId) params.set('thread', selectedThreadId);
    setSearchParams(params, { replace: true });
  }, [selectedThreadId, setSearchParams]);

  // Selected thread data
  const selectedThread = threads.find(t => t.id === selectedThreadId);

  // Filter threads
  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || thread.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handlers
  const handleSendMessage = async (content: string) => {
    if (selectedThreadId && user) {
      await sendMessageAsync({
        threadId: selectedThreadId,
        senderId: currentUser.id,
        senderRole: user.role,
        senderName: user.displayName,
        content,
      });
      await loadData();
      const messages = await getMessagesAsync(selectedThreadId);
      setThreadMessages(messages);
    }
  };

  const handleSelectThread = async (threadId: string) => {
    setSelectedThreadId(threadId);
    await markMessagesAsReadAsync(threadId, currentUser.id);
    await loadData();
  };

  const handleCreateThread = async (data: {
    subject: string;
    category: Thread['category'];
    participants: { id: string; role: UserRole; name: string }[];
    initialMessage: string;
  }) => {
    const newThread = await createThreadAsync({
      subject: data.subject,
      category: data.category,
      participants: data.participants,
      lastMessage: data.initialMessage,
      unreadCount: 0,
    });

    await sendMessageAsync({
      threadId: newThread.id,
      senderId: currentUser.id,
      senderRole: user?.role || null,
      senderName: user?.displayName || 'User',
      content: data.initialMessage,
    });

    await loadData();
    setSelectedThreadId(newThread.id);
    setShowNewThread(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessageAsync(messageId);
    await loadData();
    if (selectedThreadId) {
      const messages = await getMessagesAsync(selectedThreadId);
      setThreadMessages(messages);
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!window.confirm('Are you sure you want to delete this conversation? This cannot be undone.')) return;
    await deleteThreadAsync(threadId);
    await loadData();
    setSelectedThreadId(null);
  };

  // Other participants for new thread
  const availableParticipants = ALL_PARTICIPANTS.filter(p => p.id !== currentUser.id);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner message="Loading messages..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cc-text">Communication Hub</h1>
          <p className="text-cc-muted">Messages, scheduling, and feedback</p>
        </div>
        <button
          onClick={() => setShowNewThread(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          New Conversation
        </button>
      </div>


      {/* Content */}
      <div className="min-h-[600px]">
        {/* Messages Tab */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Thread List */}
            <div className={cn('lg:col-span-1 space-y-4', selectedThreadId && 'hidden lg:block')}>
              {/* Search and Filter */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cc-muted" />
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
                  <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-cc-muted pointer-events-none" />
                </div>
              </div>

              {/* Thread Items */}
              <div className="space-y-2">
                {filteredThreads.length === 0 ? (
                  <div className="text-center py-12 text-cc-muted">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No conversations found</p>
                    <button
                      onClick={() => setShowNewThread(true)}
                      className="text-cc-accent hover:underline mt-2"
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
                      onDelete={handleDeleteThread}
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
                    onDeleteMessage={handleDeleteMessage}
                  />
                  <MessageComposer onSend={handleSendMessage} />
                  <div className="px-4 pb-3">
                    <button
                      onClick={() => handleDeleteThread(selectedThreadId!)}
                      className="flex items-center gap-2 w-full justify-center py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete conversation"
                    >
                      <Trash2 size={14} />
                      Delete Conversation
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-cc-muted">
                  <div className="text-center">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to view messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
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
  onDelete: (threadId: string) => void;
}

function ThreadItem({ thread, isSelected, onClick, onDelete }: ThreadItemProps) {
  const getCategoryColor = (category: Thread['category']) => {
    const colors = {
      general: 'bg-cc-border/50',
      maintenance: 'bg-indigo-400/20',
      lease: 'bg-purple-500/20',
      inspection: 'bg-blue-500/20',
    };
    return colors[category] || colors.general;
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg cursor-pointer transition-all border group',
        isSelected
          ? 'bg-cc-surface border-cc-accent/50'
          : 'bg-cc-surface/30 border-cc-border/50 hover:bg-cc-surface/50'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-cc-text truncate flex-1">{thread.subject}</h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          {thread.unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cc-accent text-white">
              {thread.unreadCount}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(thread.id); }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-all"
            title="Delete conversation"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className="text-sm text-cc-muted line-clamp-1 mb-2">{thread.lastMessage}</p>
      <div className="flex items-center justify-between text-xs">
        <span className={cn('px-2 py-0.5 rounded-full capitalize', getCategoryColor(thread.category))}>
          {thread.category}
        </span>
        <span className="text-cc-muted">{formatRelativeTime(thread.lastMessageTime)}</span>
      </div>
    </div>
  );
}
