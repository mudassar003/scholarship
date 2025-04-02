// src/services/universityService.ts
import { supabase } from '@/lib/supabase';
import { University } from '@/types';

export const getUniversities = async (): Promise<University[]> => {
  const { data, error } = await supabase
    .from('universities')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching universities:', error);
    return [];
  }

  return data || [];
};

export const getUniversityById = async (id: string): Promise<University | null> => {
  const { data, error } = await supabase
    .from('universities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching university with id ${id}:`, error);
    return null;
  }

  return data;
};

export const createUniversity = async (
  university: Omit<University, 'id' | 'created_at' | 'updated_at'>
): Promise<University | null> => {
  const { data, error } = await supabase
    .from('universities')
    .insert(university)
    .select()
    .single();

  if (error) {
    console.error('Error creating university:', error);
    return null;
  }

  return data;
};

export const updateUniversity = async (
  id: string,
  updates: Partial<University>
): Promise<University | null> => {
  const { data, error } = await supabase
    .from('universities')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating university with id ${id}:`, error);
    return null;
  }

  return data;
};

export const deleteUniversity = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('universities')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting university with id ${id}:`, error);
    return false;
  }

  return true;
};

export const getUniversitiesByCountry = async (countryId: string): Promise<University[]> => {
  const { data, error } = await supabase
    .from('universities')
    .select('*')
    .eq('country_id', countryId)
    .order('name', { ascending: true });

  if (error) {
    console.error(`Error fetching universities for country_id ${countryId}:`, error);
    return [];
  }

  return data || [];
};