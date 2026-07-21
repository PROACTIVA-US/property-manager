/**
 * Teacher Profile - Data Access Layer
 * CRUD for teacher_profiles and contact_submissions
 *
 * Note: These tables are not yet in the generated database.types.ts.
 * We use the untyped Supabase client for these queries until types are regenerated.
 */

import { supabase } from './supabase';

// Untyped client for tables not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// ============ Types ============

export interface ScheduleSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  label: string;
}

export interface TeacherProfile {
  id: string;
  userId: string | null;
  name: string;
  tagline: string;
  bio: string;
  philosophy: string;
  photoUrl: string | null;
  schedule: ScheduleSlot[];
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmission {
  id: string;
  teacherId: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

// ============ Default / Placeholder ============

export const DEFAULT_PROFILE: Omit<TeacherProfile, 'id' | 'createdAt' | 'updatedAt'> = {
  userId: null,
  name: 'Shanie',
  tagline: 'Passionate about inspiring young minds',
  bio: 'Welcome to my page! I love creating engaging learning experiences that help students discover their potential.',
  philosophy: 'Every child deserves a classroom where they feel safe, valued, and excited to learn.',
  photoUrl: null,
  schedule: [
    { id: '1', day: 'Monday', startTime: '8:00 AM', endTime: '3:00 PM', label: 'Regular Day' },
    { id: '2', day: 'Tuesday', startTime: '8:00 AM', endTime: '3:00 PM', label: 'Regular Day' },
    { id: '3', day: 'Wednesday', startTime: '8:00 AM', endTime: '1:00 PM', label: 'Early Release' },
    { id: '4', day: 'Thursday', startTime: '8:00 AM', endTime: '3:00 PM', label: 'Regular Day' },
    { id: '5', day: 'Friday', startTime: '8:00 AM', endTime: '3:00 PM', label: 'Regular Day' },
  ],
  settings: {},
};

// ============ DB Mapping ============

interface DbTeacherProfile {
  id: string;
  user_id: string | null;
  name: string;
  tagline: string | null;
  bio: string | null;
  philosophy: string | null;
  photo_url: string | null;
  schedule: unknown;
  settings: unknown;
  created_at: string;
  updated_at: string;
}

function mapDbToProfile(row: DbTeacherProfile): TeacherProfile {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    tagline: row.tagline || '',
    bio: row.bio || '',
    philosophy: row.philosophy || '',
    photoUrl: row.photo_url,
    schedule: (row.schedule as ScheduleSlot[]) || [],
    settings: (row.settings as Record<string, unknown>) || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============ Profile CRUD ============

export async function getTeacherProfile(): Promise<TeacherProfile | null> {
  const { data, error } = await db
    .from('teacher_profiles')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return mapDbToProfile(data as DbTeacherProfile);
}

export async function getTeacherProfileByUserId(userId: string): Promise<TeacherProfile | null> {
  const { data, error } = await db
    .from('teacher_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return mapDbToProfile(data as DbTeacherProfile);
}

export async function upsertTeacherProfile(
  userId: string,
  updates: Partial<Omit<TeacherProfile, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<TeacherProfile | null> {
  const dbData: Record<string, unknown> = {
    user_id: userId,
  };

  if (updates.name !== undefined) dbData.name = updates.name;
  if (updates.tagline !== undefined) dbData.tagline = updates.tagline;
  if (updates.bio !== undefined) dbData.bio = updates.bio;
  if (updates.philosophy !== undefined) dbData.philosophy = updates.philosophy;
  if (updates.photoUrl !== undefined) dbData.photo_url = updates.photoUrl;
  if (updates.schedule !== undefined) dbData.schedule = updates.schedule;
  if (updates.settings !== undefined) dbData.settings = updates.settings;

  const { data, error } = await db
    .from('teacher_profiles')
    .upsert(dbData, { onConflict: 'user_id' })
    .select()
    .single();

  if (error || !data) {
    console.error('Error upserting teacher profile:', error);
    return null;
  }

  return mapDbToProfile(data as DbTeacherProfile);
}

// ============ Contact Submissions ============

export async function submitContactForm(
  teacherId: string,
  submission: { name: string; email: string; message: string }
): Promise<boolean> {
  const { error } = await db
    .from('contact_submissions')
    .insert({
      teacher_id: teacherId,
      name: submission.name,
      email: submission.email,
      message: submission.message,
    });

  if (error) {
    console.error('Error submitting contact form:', error);
    return false;
  }

  return true;
}

export async function getContactSubmissions(teacherId: string): Promise<ContactSubmission[]> {
  const { data, error } = await db
    .from('contact_submissions')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  interface DbContactSubmission {
    id: string;
    teacher_id: string;
    name: string;
    email: string;
    message: string;
    created_at: string;
  }

  return (data as DbContactSubmission[]).map((row) => ({
    id: row.id,
    teacherId: row.teacher_id,
    name: row.name,
    email: row.email,
    message: row.message,
    createdAt: row.created_at,
  }));
}

// ============ Photo Upload ============

export async function uploadTeacherPhoto(
  userId: string,
  file: File
): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/profile.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('teacher-photos')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error('Error uploading photo:', uploadError);
    return null;
  }

  const { data } = supabase.storage
    .from('teacher-photos')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
