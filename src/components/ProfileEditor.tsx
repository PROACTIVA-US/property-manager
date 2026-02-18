import { useState, useEffect, useRef } from 'react';
import { Save, Upload, Plus, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getTeacherProfileByUserId,
  upsertTeacherProfile,
  uploadTeacherPhoto,
  DEFAULT_PROFILE,
  type ScheduleSlot,
} from '../lib/teacherProfile';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ProfileEditor() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(DEFAULT_PROFILE.name);
  const [tagline, setTagline] = useState(DEFAULT_PROFILE.tagline);
  const [bio, setBio] = useState(DEFAULT_PROFILE.bio);
  const [philosophy, setPhilosophy] = useState(DEFAULT_PROFILE.philosophy);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(DEFAULT_PROFILE.schedule);

  useEffect(() => {
    if (!user) return;
    getTeacherProfileByUserId(user.uid).then((profile) => {
      if (profile) {
        setName(profile.name);
        setTagline(profile.tagline);
        setBio(profile.bio);
        setPhilosophy(profile.philosophy);
        setPhotoUrl(profile.photoUrl);
        setSchedule(profile.schedule);
      }
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);

    await upsertTeacherProfile(user.uid, {
      name,
      tagline,
      bio,
      philosophy,
      photoUrl,
      schedule,
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setSaving(true);
    const url = await uploadTeacherPhoto(user.uid, file);
    if (url) {
      setPhotoUrl(url);
    }
    setSaving(false);
  };

  const addScheduleSlot = () => {
    setSchedule([
      ...schedule,
      {
        id: crypto.randomUUID(),
        day: 'Monday',
        startTime: '8:00 AM',
        endTime: '3:00 PM',
        label: '',
      },
    ]);
  };

  const updateSlot = (id: string, updates: Partial<ScheduleSlot>) => {
    setSchedule(schedule.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeSlot = (id: string) => {
    setSchedule(schedule.filter((s) => s.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-cc-muted" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-cc-text">Edit Your Page</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-cc-accent text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Profile Photo */}
      <div>
        <label className="block text-sm font-medium text-cc-muted mb-2">Profile Photo</label>
        <div className="flex items-center gap-4">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Profile"
              className="w-24 h-24 rounded-xl object-cover border border-cc-border"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-cc-surface border border-cc-border flex items-center justify-center text-cc-muted text-2xl font-bold">
              {name.charAt(0)}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-cc-surface border border-cc-border rounded-lg text-cc-text hover:bg-cc-border transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload Photo
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-cc-muted mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-cc-muted mb-1">Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent transition-colors"
          />
        </div>
      </div>

      {/* Bio & Philosophy */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-cc-muted mb-1">About Me</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent transition-colors resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-cc-muted mb-1">Teaching Philosophy</label>
          <textarea
            value={philosophy}
            onChange={(e) => setPhilosophy(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-cc-bg border border-cc-border rounded-lg text-cc-text focus:outline-none focus:border-cc-accent transition-colors resize-none"
          />
        </div>
      </div>

      {/* Schedule */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-cc-muted">Schedule</label>
          <button
            onClick={addScheduleSlot}
            className="flex items-center gap-1 text-sm text-cc-accent hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add Slot
          </button>
        </div>

        <div className="space-y-3">
          {schedule.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center gap-3 p-3 bg-cc-surface border border-cc-border rounded-lg"
            >
              <select
                value={slot.day}
                onChange={(e) => updateSlot(slot.id, { day: e.target.value })}
                className="px-3 py-1.5 bg-cc-bg border border-cc-border rounded-lg text-cc-text text-sm focus:outline-none focus:border-cc-accent"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <input
                type="text"
                value={slot.startTime}
                onChange={(e) => updateSlot(slot.id, { startTime: e.target.value })}
                placeholder="Start"
                className="w-24 px-2 py-1.5 bg-cc-bg border border-cc-border rounded-lg text-cc-text text-sm focus:outline-none focus:border-cc-accent"
              />
              <span className="text-cc-muted">–</span>
              <input
                type="text"
                value={slot.endTime}
                onChange={(e) => updateSlot(slot.id, { endTime: e.target.value })}
                placeholder="End"
                className="w-24 px-2 py-1.5 bg-cc-bg border border-cc-border rounded-lg text-cc-text text-sm focus:outline-none focus:border-cc-accent"
              />
              <input
                type="text"
                value={slot.label}
                onChange={(e) => updateSlot(slot.id, { label: e.target.value })}
                placeholder="Label"
                className="flex-1 px-2 py-1.5 bg-cc-bg border border-cc-border rounded-lg text-cc-text text-sm focus:outline-none focus:border-cc-accent"
              />
              <button
                onClick={() => removeSlot(slot.id)}
                className="p-1.5 text-cc-muted hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
