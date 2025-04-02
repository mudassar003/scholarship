// src/services/countryService.ts
import { supabase } from '@/lib/supabase';
import { Country } from '@/types';

export const getCountries = async (): Promise<Country[]> => {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching countries:', error);
    return [];
  }

  return data || [];
};

export const getCountryById = async (id: string): Promise<Country | null> => {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching country with id ${id}:`, error);
    return null;
  }

  return data;
};

export const createCountry = async (
  country: Omit<Country, 'id' | 'created_at' | 'updated_at'>
): Promise<Country | null> => {
  const { data, error } = await supabase
    .from('countries')
    .insert(country)
    .select()
    .single();

  if (error) {
    console.error('Error creating country:', error);
    return null;
  }

  return data;
};

export const updateCountry = async (
  id: string,
  updates: Partial<Country>
): Promise<Country | null> => {
  const { data, error } = await supabase
    .from('countries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating country with id ${id}:`, error);
    return null;
  }

  return data;
};

export const deleteCountry = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('countries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting country with id ${id}:`, error);
    return false;
  }

  return true;
};