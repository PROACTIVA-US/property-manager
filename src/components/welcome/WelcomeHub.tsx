import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ImageCarousel } from './ImageCarousel';
import { NotificationCenter, NotificationBell } from './NotificationCenter';
import { getUnreadCount } from '../../lib/notifications';
import { getProjects } from '../../lib/projects';
import { getVendors } from '../../lib/vendors';
import { getThreads } from '../../lib/messages';

export function WelcomeHub() {
  const { user } = useAuth();
  const userRole = user?.role;
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  const projects = getProjects();
  const activeProjects = projects.filter((p: any) =>
    p.status === 'in_progress' || p.status === 'approved'
  );

  const vendors = getVendors();
  const activeVendors = vendors.filter(v => v.status !== 'inactive');

  const threads = getThreads();
  const unreadMessages = threads.reduce((acc, t) => acc + t.unreadCount, 0);

  const unreadNotifications = getUnreadCount();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.displayName}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            {getGreeting()}
          </p>
        </div>

        {/* Notification Bell */}
        <NotificationBell onClick={() => setNotificationCenterOpen(true)} />
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickLinkCard
          to="/projects"
          icon="📋"
          title="Projects"
          count={activeProjects.length}
          subtitle={`${activeProjects.length} active`}
          color="blue"
        />

        <QuickLinkCard
          to="/vendors"
          icon="🔧"
          title="Vendors"
          count={activeVendors.length}
          subtitle={`${activeVendors.length} active`}
          color="purple"
        />

        <QuickLinkCard
          to="/messages"
          icon="💬"
          title="Messages"
          count={unreadMessages}
          subtitle={unreadMessages > 0 ? `${unreadMessages} unread` : 'All caught up'}
          color="green"
          badge={unreadMessages > 0}
        />

        <QuickLinkCard
          to="/financials"
          icon="📊"
          title="Financials"
          subtitle="View reports"
          color="orange"
        />
      </div>

      {/* Property Gallery Carousel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">🏠 Property Gallery</h2>
            <p className="text-sm text-gray-500">Browse your property photos</p>
          </div>
          <Link
            to="/gallery"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View All
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <ImageCarousel
          autoPlay={true}
          autoPlayInterval={5000}
          showPrimaryOnly={true}
          maxImages={10}
          height="400px"
          showControls={true}
          showIndicators={true}
          showCaption={true}
        />
      </div>

      {/* Bottom Grid - Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
            <button
              onClick={() => setNotificationCenterOpen(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All ({unreadNotifications})
            </button>
          </div>

          <RecentNotificationsPreview />
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
            <Link
              to="/projects"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All ({activeProjects.length})
            </Link>
          </div>

          {activeProjects.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-gray-500 text-sm">No active projects</p>
              {userRole === 'pm' && (
                <Link
                  to="/projects"
                  className="mt-3 inline-block text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Create a project
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {activeProjects.slice(0, 3).map((project: any) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">{project.title}</h4>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-1">{project.description}</p>
                  {project.estimatedCost && (
                    <p className="text-xs text-gray-500 mt-1">
                      Est. ${project.estimatedCost.toLocaleString()}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Role-specific Quick Actions */}
      {userRole && <RoleSpecificActions role={userRole} />}

      {/* Notification Center Sidepanel */}
      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />
    </div>
  );
}

// Quick Link Card Component
interface QuickLinkCardProps {
  to: string;
  icon: string;
  title: string;
  count?: number;
  subtitle: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
  badge?: boolean;
}

function QuickLinkCard({ to, icon, title, count, subtitle, color, badge }: QuickLinkCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    orange: 'from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-orange-700',
  };

  return (
    <Link
      to={to}
      className={`relative p-6 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-1`}
    >
      {badge && (
        <div className="absolute top-2 right-2 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
      )}

      <div className="text-4xl mb-3">{icon}</div>

      <h3 className="text-lg font-semibold mb-1">{title}</h3>

      {count !== undefined && (
        <p className="text-3xl font-bold mb-1">{count}</p>
      )}

      <p className="text-sm text-white/90">{subtitle}</p>
    </Link>
  );
}

// Recent Notifications Preview Component
function RecentNotificationsPreview() {
  const { user } = useAuth();
  const userRole = user?.role;
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (userRole) {
      import('../../lib/notifications').then(({ aggregateNotifications }) => {
        setNotifications(aggregateNotifications(userRole).slice(0, 3));
      });
    }
  }, [userRole]);

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🔔</div>
        <p className="text-gray-500 text-sm">No new notifications</p>
      </div>
    );
  }

  return <NotificationList notifications={notifications} />;
}

// Separate component to handle notification display
function NotificationList({ notifications }: { notifications: any[] }) {
  const [utils, setUtils] = useState<any>(null);

  useEffect(() => {
    import('../../lib/notifications').then((module) => {
      setUtils({
        getNotificationIcon: module.getNotificationIcon,
        formatTimestamp: module.formatTimestamp,
      });
    });
  }, []);

  if (!utils) {
    return (
      <div className="flex items-center justify-center py-4">
        <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="ml-2 text-gray-500 text-sm">Loading...</span>
      </div>
    );
  }

  const { getNotificationIcon, formatTimestamp } = utils;

  return (
    <div className="space-y-3">
      {notifications.map((notification: any) => (
        <div
          key={notification.id}
          className={`p-3 rounded-lg border transition ${
            !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.body}</p>
              <p className="text-xs text-gray-500 mt-1">{formatTimestamp(notification.timestamp)}</p>
            </div>
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-orange-100 text-orange-800',
    on_hold: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.draft}`}>
      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

// Role-specific Quick Actions
function RoleSpecificActions({ role }: { role: string }) {
  if (role === 'pm') {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            to="/projects"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition text-center"
          >
            <div className="text-3xl mb-2">➕</div>
            <p className="font-medium text-gray-900 text-sm">Create Project</p>
          </Link>

          <Link
            to="/messages"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition text-center"
          >
            <div className="text-3xl mb-2">✉️</div>
            <p className="font-medium text-gray-900 text-sm">Send Message</p>
          </Link>

          <Link
            to="/gallery"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition text-center"
          >
            <div className="text-3xl mb-2">📸</div>
            <p className="font-medium text-gray-900 text-sm">Upload Photos</p>
          </Link>
        </div>
      </div>
    );
  }

  if (role === 'tenant') {
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            to="/maintenance"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition text-center"
          >
            <div className="text-3xl mb-2">🔧</div>
            <p className="font-medium text-gray-900 text-sm">Report Issue</p>
          </Link>

          <Link
            to="/messages"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition text-center"
          >
            <div className="text-3xl mb-2">💬</div>
            <p className="font-medium text-gray-900 text-sm">Message PM</p>
          </Link>

          <Link
            to="/payments"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition text-center"
          >
            <div className="text-3xl mb-2">💳</div>
            <p className="font-medium text-gray-900 text-sm">Make Payment</p>
          </Link>
        </div>
      </div>
    );
  }

  if (role === 'owner') {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            to="/financials"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition text-center"
          >
            <div className="text-3xl mb-2">📊</div>
            <p className="font-medium text-gray-900 text-sm">View Reports</p>
          </Link>

          <Link
            to="/projects"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition text-center"
          >
            <div className="text-3xl mb-2">👁️</div>
            <p className="font-medium text-gray-900 text-sm">Review Projects</p>
          </Link>

          <Link
            to="/messages"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition text-center"
          >
            <div className="text-3xl mb-2">💬</div>
            <p className="font-medium text-gray-900 text-sm">Message PM</p>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

// Helper function to get greeting based on time
function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Here's what's happening with your property this morning";
  if (hour < 17) return "Here's what's happening with your property this afternoon";
  return "Here's what's happening with your property this evening";
}
