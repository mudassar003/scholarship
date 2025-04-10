// src/services/professorService.ts
import { supabase, uploadFile, deleteFile } from '@/lib/supabase';
import { Professor } from '@/types';

export const getProfessors = async (): Promise<Professor[]> => {
  const { data, error } = await supabase
    .from('professors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching professors:', error);
    return [];
  }

  return data || [];
};

export const getProfessorById = async (id: string): Promise<Professor | null> => {
  const { data, error } = await supabase
    .from('professors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching professor with id ${id}:`, error);
    return null;
  }

  return data;
};

export const createProfessor = async (
  professor: Omit<Professor, 'id' | 'created_at' | 'updated_at'>,
  emailScreenshot?: File | null,
  proposalPdf?: File | null
): Promise<Professor | null> => {
  try {
    // Prepare the data to insert - only the essential fields
    const professorData: Partial<Professor> = {
      name: professor.name,
      email: professor.email
    };
    
    // Add optional fields only if they have values
    if (professor.university_id) professorData.university_id = professor.university_id;
    if (professor.university_name) professorData.university_name = professor.university_name;
    if (professor.country) professorData.country = professor.country;
    if (professor.lab) professorData.lab = professor.lab;
    if (professor.department) professorData.department = professor.department;
    if (professor.research) professorData.research = professor.research;
    if (professor.scholarship) professorData.scholarship = professor.scholarship;
    if (professor.status) professorData.status = professor.status;
    if (professor.email_date) professorData.email_date = professor.email_date;
    if (professor.reply_date) professorData.reply_date = professor.reply_date;
    if (professor.notes) professorData.notes = professor.notes;
    if (professor.reminder_date) professorData.reminder_date = professor.reminder_date;
    if (professor.next_reminder) professorData.next_reminder = professor.next_reminder;
    
    // Handle boolean with explicit check
    if (typeof professor.notification_enabled !== 'undefined') {
      professorData.notification_enabled = professor.notification_enabled;
    }
    
    // Upload files if available
    if (emailScreenshot) {
      const emailScreenshotUrl = await uploadFile('professors', 'email_screenshots', emailScreenshot);
      if (emailScreenshotUrl) {
        professorData.email_screenshot = { url: emailScreenshotUrl };
      }
    }
    
    if (proposalPdf) {
      const proposalPdfUrl = await uploadFile('professors', 'proposals', proposalPdf);
      if (proposalPdfUrl) {
        professorData.proposal = { url: proposalPdfUrl };
      }
    }
    
    console.log('Creating professor with data:', professorData);

    // Create professor record
    const { data, error } = await supabase
      .from('professors')
      .insert(professorData)
      .select()
      .single();

    if (error) {
      console.error('Error creating professor:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createProfessor:', error);
    return null;
  }
};

export const updateProfessor = async (
  id: string,
  updates: Partial<Professor>,
  emailScreenshot?: File | null,
  proposalPdf?: File | null
): Promise<Professor | null> => {
  try {
    // Get current professor data for reference
    const currentProfessor = await getProfessorById(id);
    if (!currentProfessor) {
      console.error(`Professor with id ${id} not found`);
      return null;
    }

    // Upload new files if provided
    if (emailScreenshot) {
      // Delete old file if exists
      if (currentProfessor.email_screenshot?.url) {
        await deleteFile('professors', currentProfessor.email_screenshot.url);
      }
      
      const emailScreenshotUrl = await uploadFile('professors', 'email_screenshots', emailScreenshot);
      if (emailScreenshotUrl) {
        updates.email_screenshot = { url: emailScreenshotUrl };
      }
    }
    
    if (proposalPdf) {
      // Delete old file if exists
      if (currentProfessor.proposal?.url) {
        await deleteFile('professors', currentProfessor.proposal.url);
      }
      
      const proposalPdfUrl = await uploadFile('professors', 'proposals', proposalPdf);
      if (proposalPdfUrl) {
        updates.proposal = { url: proposalPdfUrl };
      }
    }
    
    // Update professor record
    const { data, error } = await supabase
      .from('professors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating professor with id ${id}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateProfessor:', error);
    return null;
  }
};

export const deleteProfessor = async (id: string): Promise<boolean> => {
  try {
    // Get professor details to delete associated files
    const professor = await getProfessorById(id);
    
    if (professor) {
      // Delete associated files if they exist
      if (professor.email_screenshot?.url) {
        await deleteFile('professors', professor.email_screenshot.url);
      }
      
      if (professor.proposal?.url) {
        await deleteFile('professors', professor.proposal.url);
      }
    }
    
    // Delete professor record
    const { error } = await supabase
      .from('professors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting professor with id ${id}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProfessor:', error);
    return false;
  }
};