// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// File upload helper functions
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<string | null> => {
  try {
    // Create unique file name to prevent overwriting
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error } = await supabase.storage.from(bucket).upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error.message);
      return null;
    }

    // Get public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
};

// Delete file helper
export const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
  try {
    // Extract filename from full URL or path
    const fileName = path.split('/').pop();
    if (!fileName) return false;
    
    // Get storage path without the bucket URL prefix
    const filePath = path.includes(bucket)
      ? path.split(`${bucket}/`)[1]
      : path;

    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    
    if (error) {
      console.error('Error deleting file:', error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
};