import { useState, useEffect, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MessageThread from '../MessageThread';
import { MessageComposer } from '../MessageComposer';
import {
  getThreads,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  type Thread,
  type Message,
} from '../../lib/messages';

export default function TenantMessages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Current user info for tenant
  const currentUser = {
    id: 'tenant-1',
    role: user?.role || 'tenant',
    name: user?.displayName || 'Tenant',
  };

  // Load threads filtered for tenant participation
  const loadData = useCallback(() => {
    const allThreads = getThreads();
    const tenantThreads = allThreads.filter(t =>
      t.participants.some(p => p.role === 'tenant')
    );
    setThreads(tenantThreads);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load messages when thread is selected
  useEffect(() => {
    if (selectedThread) {
      const threadMessages = getMessages(selectedThread.id);
      setMessages(threadMessages);
      markMessagesAsRead(selectedThread.id, currentUser.id);
    }
  }, [selectedThread, currentUser.id]);

  const handleSendMessage = (content: string) => {
    if (!selectedThread || !content.trim()) return;

    sendMessage({
      threadId: selectedThread.id,
      senderId: currentUser.id,
      senderRole: 'tenant',
      senderName: currentUser.name,
      content: content.trim(),
    });

    // Refresh messages
    setMessages(getMessages(selectedThread.id));
    loadData(); // Refresh thread list to update last message
  };

  const handleSelectThread = (thread: Thread) => {
    setSelectedThread(thread);
  };

  const handleBack = () => {
    setSelectedThread(null);
    setMessages([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Thread List */}
      <div className="lg:col-span-1 space-y-2">
        <h2 className="font-semibold text-cc-text mb-4">Your Messages</h2>
        {threads.length === 0 ? (
          <div className="text-center py-8 text-cc-muted">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No messages yet</p>
          </div>
        ) : (
          threads.map(thread => (
            <button
              key={thread.id}
              onClick={() => handleSelectThread(thread)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedThread?.id === thread.id
                  ? 'border-cc-accent bg-cc-accent/10'
                  : 'border-cc-border hover:border-cc-accent/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-cc-text text-sm">{thread.subject}</p>
                {thread.unreadCount > 0 && (
                  <span className="bg-cc-accent text-white text-xs px-2 py-0.5 rounded-full">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-cc-muted line-clamp-1 mt-1">{thread.lastMessage}</p>
            </button>
          ))
        )}
      </div>

      {/* Message Thread View */}
      <div className="lg:col-span-2 card p-0 overflow-hidden flex flex-col min-h-[400px]">
        {selectedThread ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <MessageThread
                thread={selectedThread}
                messages={messages}
                currentUserId={currentUser.id}
                currentUserRole="tenant"
                onBack={handleBack}
              />
            </div>
            <div className="border-t border-cc-border p-4">
              <MessageComposer
                onSend={handleSendMessage}
                placeholder="Type your message..."
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-cc-muted">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
              <p>Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
