// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verify Supabase connection
export const verifySupabaseConnection = async (): Promise<boolean> => {
  try {
    // Attempt to query a simple table to verify connection
    const { data, error } = await supabase
      .from('professors')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection verified successfully');
    return true;
  } catch (error) {
    console.error('Error verifying Supabase connection:', error);
    return false;
  }
};

// File upload helper functions
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<string | null> => {
  try {
    // Verify bucket exists first
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError.message);
      return null;
    }
    
    const bucketExists = buckets.some(b => b.name === bucket);
    
    if (!bucketExists) {
      console.error(`Bucket '${bucket}' does not exist. Available buckets:`, buckets.map(b => b.name));
      // You might want to create the bucket automatically
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: true
      });
      
      if (createError) {
        console.error(`Error creating bucket '${bucket}':`, createError.message);
        return null;
      }
      
      console.log(`Bucket '${bucket}' created successfully`);
    }
    
    // Create unique file name to prevent overwriting
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    console.log(`Uploading file to ${bucket}/${filePath}`);
    
    const { error } = await supabase.storage.from(bucket).upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error.message);
      return null;
    }

    // Get public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    console.log('File uploaded successfully, public URL:', data.publicUrl);
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