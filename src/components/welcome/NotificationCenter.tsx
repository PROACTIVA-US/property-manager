import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  deleteNotification,
  aggregateNotifications,
  getNotificationIcon,
  getNotificationColor,
  formatTimestamp,
  type Notification,
  type NotificationType,
} from '../../lib/notifications';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  maxHeight?: string;
}

export function NotificationCenter({ isOpen, onClose, maxHeight = '500px' }: NotificationCenterProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userRole) {
      setLoading(true);
      // Aggregate new notifications from all sources
      const aggregated = aggregateNotifications(userRole);
      setNotifications(aggregated);
      setLoading(false);
    }
  }, [isOpen, userRole]);

  const filteredNotifications = notifications.filter(n => {
    if (!showArchived && n.archived) return false;
    if (filter !== 'all' && n.type !== filter) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);
    setNotifications(getNotifications());

    // Navigate if link exists
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    setNotifications(getNotifications());
  };

  const handleArchive = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    archiveNotification(notificationId);
    setNotifications(getNotifications());
  };

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    if (confirm('Delete this notification?')) {
      deleteNotification(notificationId);
      setNotifications(getNotifications());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-500">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Mark all read
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showArchived ? 'Hide' : 'Show'} archived
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-2">
            <div className="flex gap-2 overflow-x-auto">
              {(['all', 'message', 'project_status', 'maintenance', 'payment_due'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
                    filter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {type === 'all' ? 'All' : type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight }}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="ml-2 text-gray-500 text-sm">Loading notifications...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="text-5xl mb-3">🔔</div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
                <p className="text-sm text-gray-500">
                  {filter === 'all' ? "You're all caught up!" : `No ${filter.replace('_', ' ')} notifications`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    } ${notification.archived ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                          )}
                        </div>

                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {notification.body}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <span className={getNotificationColor(notification.priority)}>
                            {notification.priority !== 'normal' && `${notification.priority.toUpperCase()} • `}
                          </span>
                          <span>{formatTimestamp(notification.timestamp)}</span>
                          {notification.actionRequired && (
                            <>
                              <span>•</span>
                              <span className="text-orange-600 font-medium">Action required</span>
                            </>
                          )}
                          {notification.archived && (
                            <>
                              <span>•</span>
                              <span className="text-gray-400">Archived</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1">
                        {!notification.archived && (
                          <button
                            onClick={(e) => handleArchive(e, notification.id)}
                            className="text-gray-400 hover:text-gray-600 transition"
                            title="Archive"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(e, notification.id)}
                          className="text-gray-400 hover:text-red-600 transition"
                          title="Delete"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Notification Bell Badge Component (for header)
export function NotificationBell({ onClick }: { onClick: () => void }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const userRole = user?.role;

  useEffect(() => {
    const updateCount = () => {
      if (userRole) {
        const notifications = aggregateNotifications(userRole);
        const unread = notifications.filter(n => !n.read && !n.archived).length;
        setUnreadCount(unread);
      }
    };

    updateCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(updateCount, 30000);

    return () => clearInterval(interval);
  }, [userRole]);

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 transition"
      title="Notifications"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-600 rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
