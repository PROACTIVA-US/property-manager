import { supabase } from './supabase';
import type { Tables } from './database.types';

type Profile = Tables<'profiles'>;

export async function fetchAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateProfileRole(
  userId: string,
  newRole: 'owner' | 'pm' | 'tenant' | 'admin'
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) throw error;
}

export async function deleteProfile(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) throw error;
}
