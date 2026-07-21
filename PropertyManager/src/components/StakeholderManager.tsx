import { useState } from 'react';
import { Plus, User, Mail, Phone, Crown, Trash2 } from 'lucide-react';
import type { Project, Stakeholder } from '../lib/projects';
import { updateProject } from '../lib/projects';
import type { UserRole } from '../contexts/AuthContext';

interface StakeholderManagerProps {
  project: Project;
  onUpdate: () => void;
}

export default function StakeholderManager({ project, onUpdate }: StakeholderManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'owner' as UserRole,
    email: '',
    phone: '',
    notificationPreference: 'all' as Stakeholder['notificationPreference'],
  });

  const handleAddStakeholder = () => {
    if (!formData.name || !formData.email) return;

    const newStakeholder: Stakeholder = {
      id: `stakeholder_${Date.now()}`,
      name: formData.name,
      role: formData.role,
      email: formData.email,
      phone: formData.phone || undefined,
      isProjectOwner: false,
      notificationPreference: formData.notificationPreference,
    };

    updateProject(project.id, {
      stakeholders: [...project.stakeholders, newStakeholder],
    });

    setFormData({
      name: '',
      role: 'owner',
      email: '',
      phone: '',
      notificationPreference: 'all',
    });
    setIsAdding(false);
    onUpdate();
  };

  const handleRemoveStakeholder = (stakeholderId: string) => {
    const updatedStakeholders = project.stakeholders.filter(s => s.id !== stakeholderId);
    updateProject(project.id, { stakeholders: updatedStakeholders });
    onUpdate();
  };

  const handleUpdateNotificationPreference = (
    stakeholderId: string,
    preference: Stakeholder['notificationPreference']
  ) => {
    const updatedStakeholders = project.stakeholders.map(s =>
      s.id === stakeholderId ? { ...s, notificationPreference: preference } : s
    );
    updateProject(project.id, { stakeholders: updatedStakeholders });
    onUpdate();
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      owner: 'bg-indigo-400/20 text-indigo-300',
      pm: 'bg-blue-500/20 text-blue-400',
      tenant: 'bg-green-500/20 text-green-400',
    };
    return colors[role as keyof typeof colors] || 'bg-slate-500/20 text-slate-400';
  };

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      owner: 'Owner',
      pm: 'Property Manager',
      tenant: 'Tenant',
    };
    return labels[role as keyof typeof labels] || role;
  };

  return (
    <div className="space-y-4">
      {/* Stakeholders List */}
      <div className="space-y-3">
        {project.stakeholders.map(stakeholder => (
          <div
            key={stakeholder.id}
            className="bg-cc-bg rounded-lg p-4 border border-white/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-cc-bger flex items-center justify-center">
                  <User size={24} className="text-cc-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-cc-text">
                      {stakeholder.name}
                    </h4>
                    {stakeholder.isProjectOwner && (
                      <span title="Project Owner">
                        <Crown size={14} className="text-yellow-400" />
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded ${getRoleColor(stakeholder.role)}`}>
                      {getRoleLabel(stakeholder.role)}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-cc-muted">
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      <a
                        href={`mailto:${stakeholder.email}`}
                        className="hover:text-cc-text transition-colors"
                      >
                        {stakeholder.email}
                      </a>
                    </div>
                    {stakeholder.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} />
                        <a
                          href={`tel:${stakeholder.phone}`}
                          className="hover:text-cc-text transition-colors"
                        >
                          {stakeholder.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Notification Preference */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-cc-muted">Notifications:</span>
                    <div className="flex gap-1">
                      {(['all', 'important', 'none'] as const).map(pref => (
                        <button
                          key={pref}
                          onClick={() => handleUpdateNotificationPreference(stakeholder.id, pref)}
                          className={`px-2 py-1 rounded text-xs transition-colors ${
                            stakeholder.notificationPreference === pref
                              ? 'bg-cc-accent text-white'
                              : 'bg-white/10 text-cc-muted hover:text-cc-text'
                          }`}
                        >
                          {pref === 'all' && 'All'}
                          {pref === 'important' && 'Important Only'}
                          {pref === 'none' && 'None'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {!stakeholder.isProjectOwner && (
                <button
                  onClick={() => handleRemoveStakeholder(stakeholder.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                  title="Remove stakeholder"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}

        {project.stakeholders.length === 0 && !isAdding && (
          <div className="text-center py-8 bg-cc-bg rounded-lg border border-white/10">
            <User size={32} className="mx-auto text-cc-muted mb-2" />
            <p className="text-cc-muted">No stakeholders added yet</p>
          </div>
        )}
      </div>

      {/* Add Stakeholder Form */}
      {isAdding ? (
        <div className="bg-cc-bg rounded-lg p-4 border border-white/10">
          <h4 className="font-semibold text-cc-text mb-3">Add Stakeholder</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-cc-muted mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="e.g., John Smith"
                />
              </div>
              <div>
                <label className="block text-sm text-cc-muted mb-1">Role</label>
                <select
                  value={formData.role || 'owner'}
                  onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="input-field w-full"
                >
                  <option value="owner">Owner</option>
                  <option value="pm">Property Manager</option>
                  <option value="tenant">Tenant</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-cc-muted mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="input-field w-full"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-cc-muted mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field w-full"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-cc-muted mb-1">Notification Preference</label>
              <select
                value={formData.notificationPreference}
                onChange={e =>
                  setFormData({
                    ...formData,
                    notificationPreference: e.target.value as Stakeholder['notificationPreference'],
                  })
                }
                className="input-field w-full"
              >
                <option value="all">All Notifications</option>
                <option value="important">Important Only</option>
                <option value="none">None</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button onClick={handleAddStakeholder} className="btn-primary">
                Add Stakeholder
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setFormData({
                    name: '',
                    role: 'owner',
                    email: '',
                    phone: '',
                    notificationPreference: 'all',
                  });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 border-2 border-dashed border-white/20 rounded-lg text-cc-muted hover:text-cc-text hover:border-white/40 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Stakeholder
        </button>
      )}
    </div>
  );
}
