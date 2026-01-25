import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot } from 'lucide-react';
import type { Project, ProjectMessage } from '../lib/projects';
import { getProjectMessages, createProjectMessage } from '../lib/projects';
import { useAuth } from '../contexts/AuthContext';

interface ProjectMessageCenterProps {
  project: Project;
}

export default function ProjectMessageCenter({ project }: ProjectMessageCenterProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [project.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    const projectMessages = getProjectMessages(project.id);
    setMessages(projectMessages);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    createProjectMessage({
      projectId: project.id,
      senderId: user.email,
      senderName: user.displayName || user.email,
      senderRole: user.role,
      content: newMessage.trim(),
      isSystemMessage: false,
      readBy: [user.email],
    });

    setNewMessage('');
    loadMessages();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleColor = (role: string | null) => {
    if (!role) return 'text-brand-muted';
    const colors: Record<string, string> = {
      owner: 'text-orange-400',
      pm: 'text-blue-400',
      tenant: 'text-green-400',
    };
    return colors[role] || 'text-brand-muted';
  };

  const getRoleBadge = (role: string | null) => {
    if (!role) return 'Unknown';
    const labels: Record<string, string> = {
      owner: 'Owner',
      pm: 'PM',
      tenant: 'Tenant',
    };
    return labels[role] || role;
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot size={48} className="mx-auto text-brand-muted mb-4" />
            <p className="text-brand-muted">No messages yet</p>
            <p className="text-sm text-brand-muted/70 mt-1">
              Start the conversation about this project
            </p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.isSystemMessage ? 'justify-center' : 'justify-start'
              }`}
            >
              {message.isSystemMessage ? (
                <div className="bg-white/5 rounded-lg px-4 py-2 text-sm text-brand-muted text-center max-w-md">
                  <Bot size={14} className="inline mr-1" />
                  {message.content}
                  <span className="text-xs ml-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-darker flex items-center justify-center">
                    <User size={20} className={getRoleColor(message.senderRole)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-brand-light">
                        {message.senderName}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${getRoleColor(message.senderRole)} bg-white/10`}>
                        {getRoleBadge(message.senderRole)}
                      </span>
                      <span className="text-xs text-brand-muted">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-brand-dark rounded-lg px-4 py-2 border border-white/10">
                      <p className="text-sm text-brand-light whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-brand-dark rounded-lg p-3 border border-white/10">
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="flex-1 bg-brand-darker border border-white/10 rounded-lg px-3 py-2 text-brand-light placeholder-brand-muted resize-none focus:outline-none focus:ring-2 focus:ring-brand-orange"
            rows={3}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-brand-orange hover:bg-orange-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-brand-muted mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
