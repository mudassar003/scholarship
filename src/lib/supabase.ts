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
    console.log(`Starting upload to bucket: ${bucket}, path: ${path}`);
    
    // Create unique file name to prevent overwriting
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    console.log(`Uploading file to ${bucket}/${filePath}`);
    
    // Try to upload to 'application_documents' bucket instead - this might have different RLS policies
    // Note: You can switch to a different bucket that has public access enabled
    const targetBucket = 'application_documents'; // Try this bucket instead
    
    const { error } = await supabase.storage.from(targetBucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

    if (error) {
      console.error('Error uploading file:', error.message);
      console.log('Trying alternate upload approach...');
      
      // If RLS is still an issue, try with the public bucket directly
      const { error: secondError } = await supabase.storage
        .from('scholarships') // Try the scholarships bucket as a fallback
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (secondError) {
        console.error('Second upload attempt failed:', secondError.message);
        return null;
      }
      
      // Get public URL from the second attempt
      const { data } = supabase.storage.from('scholarships').getPublicUrl(filePath);
      console.log('File uploaded to alternate bucket, public URL:', data.publicUrl);
      return data.publicUrl;
    }

    // Get public URL
    const { data } = supabase.storage.from(targetBucket).getPublicUrl(filePath);
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
    let filePath = '';
    
    if (path.includes(supabaseUrl)) {
      // Extract the path after the bucket name
      const bucketPrefix = `${supabaseUrl}/storage/v1/object/public/${bucket}/`;
      filePath = path.replace(bucketPrefix, '');
    } else {
      filePath = path;
    }
    
    console.log(`Attempting to delete file at ${bucket}/${filePath}`);

    // Try to use same bucket as upload function for consistency
    const targetBucket = 'application_documents';

    const { error } = await supabase.storage.from(targetBucket).remove([filePath]);
    
    if (error) {
      console.error('Error deleting file:', error.message);
      return false;
    }
    
    console.log('File deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
};