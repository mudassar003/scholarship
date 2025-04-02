// src/services/scholarshipService.ts
import { supabase } from '@/lib/supabase';
import { Scholarship } from '@/types';

export const getScholarships = async (): Promise<Scholarship[]> => {
  const { data, error } = await supabase
    .from('scholarships')
    .select('*')
    .order('deadline', { ascending: true });

  if (error) {
    console.error('Error fetching scholarships:', error);
    return [];
  }

  return data || [];
};

export const getScholarshipById = async (id: string): Promise<Scholarship | null> => {
  const { data, error } = await supabase
    .from('scholarships')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching scholarship with id ${id}:`, error);
    return null;
  }

  return data;
};

export const createScholarship = async (
  scholarship: Omit<Scholarship, 'id' | 'created_at' | 'updated_at'>
): Promise<Scholarship | null> => {
  const { data, error } = await supabase
    .from('scholarships')
    .insert(scholarship)
    .select()
    .single();

  if (error) {
    console.error('Error creating scholarship:', error);
    return null;
  }

  return data;
};

export const updateScholarship = async (
  id: string,
  updates: Partial<Scholarship>
): Promise<Scholarship | null> => {
  const { data, error } = await supabase
    .from('scholarships')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating scholarship with id ${id}:`, error);
    return null;
  }

  return data;
};

export const deleteScholarship = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('scholarships')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting scholarship with id ${id}:`, error);
    return false;
  }

  return true;
};

export const getScholarshipsByCountry = async (countryName: string): Promise<Scholarship[]> => {
  const { data, error } = await supabase
    .from('scholarships')
    .select('*')
    .eq('country', countryName)
    .order('deadline', { ascending: true });

  if (error) {
    console.error(`Error fetching scholarships for country ${countryName}:`, error);
    return [];
  }

  return data || [];
};