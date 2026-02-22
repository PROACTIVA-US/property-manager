import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Search,
  Trash2,
  Shield,
  Info,
  Loader2,
} from 'lucide-react';
import { fetchAllProfiles, updateProfileRole, deleteProfile } from '../lib/admin';
import { useAuth } from '../contexts/AuthContext';
import type { Tables } from '../lib/database.types';
import { cn } from '../lib/utils';

type Profile = Tables<'profiles'>;
type Role = 'owner' | 'pm' | 'tenant' | 'admin';

const ROLE_COLORS: Record<Role, string> = {
  admin: 'bg-purple-500/20 text-purple-400',
  owner: 'bg-blue-500/20 text-blue-400',
  pm: 'bg-green-500/20 text-green-400',
  tenant: 'bg-gray-500/20 text-gray-400',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Error loading profiles:', err);
      setError('Failed to load profiles. Make sure you have admin access.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const filteredProfiles = useMemo(() => {
    if (!searchQuery) return profiles;
    const q = searchQuery.toLowerCase();
    return profiles.filter(
      (p) =>
        p.display_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }, [profiles, searchQuery]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { admin: 0, owner: 0, pm: 0, tenant: 0 };
    profiles.forEach((p) => {
      const role = p.role || 'tenant';
      counts[role] = (counts[role] || 0) + 1;
    });
    return counts;
  }, [profiles]);

  const handleRoleChange = async (profileId: string, newRole: Role) => {
    setUpdatingId(profileId);
    try {
      await updateProfileRole(profileId, newRole);
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, role: newRole } : p))
      );
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (profileId: string) => {
    setUpdatingId(profileId);
    try {
      await deleteProfile(profileId);
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting profile:', err);
      setError('Failed to delete profile.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-cc-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Shield className="text-purple-400" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-cc-text">User Management</h1>
          <p className="text-cc-muted mt-1">
            Manage all users, assign roles, remove access
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <Info className="text-red-400 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-400/70 hover:text-red-400 mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-cc-text">{profiles.length}</div>
          <div className="text-xs text-cc-muted mt-1">Total Users</div>
        </div>
        {(['owner', 'pm', 'tenant', 'admin'] as const).map((role) => (
          roleCounts[role] > 0 && (
            <div key={role} className="card p-4 text-center">
              <div className="text-2xl font-bold text-cc-text">{roleCounts[role]}</div>
              <div className="text-xs text-cc-muted mt-1 capitalize">{role === 'pm' ? 'PM' : role}</div>
            </div>
          )
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cc-muted" size={18} />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-cc-surface border border-cc-border rounded-lg text-cc-text placeholder:text-cc-muted focus:outline-none focus:ring-2 focus:ring-cc-accent/50 focus:border-cc-accent"
        />
      </div>

      {/* Info about adding users */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
        <Info className="text-blue-400 shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="text-sm font-medium text-blue-400 mb-1">Adding new users</h4>
          <p className="text-sm text-cc-muted">
            New users sign up through the login page and default to the tenant role.
            Use this dashboard to assign the correct role after they sign up.
          </p>
        </div>
      </div>

      {/* User list */}
      <div className="space-y-3">
        {filteredProfiles.length === 0 ? (
          <div className="card p-8 text-center">
            <Users className="mx-auto mb-3 text-cc-muted" size={32} />
            <p className="text-cc-muted">
              {searchQuery ? 'No users match your search.' : 'No users found.'}
            </p>
          </div>
        ) : (
          filteredProfiles.map((profile) => {
            const isCurrentUser = profile.id === user?.uid;
            const isDeleting = deleteConfirmId === profile.id;

            return (
              <div
                key={profile.id}
                className={cn(
                  'card p-4 transition-colors',
                  isDeleting && 'bg-red-500/5 border-red-500/30'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-cc-border flex items-center justify-center text-sm font-bold text-cc-text shrink-0">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-cc-text truncate">
                        {profile.display_name}
                      </h3>
                      {isCurrentUser && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cc-accent/20 text-cc-accent font-medium">
                          You
                        </span>
                      )}
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded font-medium capitalize',
                          ROLE_COLORS[(profile.role as Role) || 'tenant']
                        )}
                      >
                        {profile.role === 'pm' ? 'PM' : profile.role}
                      </span>
                    </div>
                    <p className="text-xs text-cc-muted truncate mt-0.5">
                      {profile.email}
                    </p>
                    <p className="text-xs text-cc-muted mt-1">
                      Joined {formatDate(profile.created_at)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Role dropdown */}
                    <select
                      value={profile.role || 'tenant'}
                      onChange={(e) =>
                        handleRoleChange(profile.id, e.target.value as Role)
                      }
                      disabled={updatingId === profile.id}
                      className="text-xs bg-cc-surface border border-cc-border rounded px-2 py-1.5 text-cc-text focus:outline-none focus:ring-1 focus:ring-cc-accent/50 disabled:opacity-50"
                    >
                      <option value="tenant">Tenant</option>
                      <option value="pm">PM</option>
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                    </select>

                    {/* Delete button */}
                    {!isDeleting ? (
                      <button
                        onClick={() => setDeleteConfirmId(profile.id)}
                        disabled={isCurrentUser || updatingId === profile.id}
                        className={cn(
                          'p-1.5 rounded transition-colors',
                          isCurrentUser
                            ? 'text-cc-muted/30 cursor-not-allowed'
                            : 'text-cc-muted hover:text-red-400 hover:bg-red-500/10'
                        )}
                        title={isCurrentUser ? "Can't delete yourself" : 'Delete user'}
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(profile.id)}
                          disabled={updatingId === profile.id}
                          className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                          {updatingId === profile.id ? 'Deleting...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-xs px-2 py-1 rounded bg-cc-border text-cc-muted hover:text-cc-text transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
