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
    // Upload files if provided
    let emailScreenshotUrl = null;
    let proposalPdfUrl = null;

    if (emailScreenshot) {
      emailScreenshotUrl = await uploadFile('professors', 'email-screenshots', emailScreenshot);
    }

    if (proposalPdf) {
      proposalPdfUrl = await uploadFile('professors', 'proposals', proposalPdf);
    }

    // Create professor record
    const { data, error } = await supabase
      .from('professors')
      .insert({
        ...professor,
        email_screenshot: emailScreenshotUrl ? { url: emailScreenshotUrl } : null,
        proposal: proposalPdfUrl ? { url: proposalPdfUrl } : null
      })
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
    // Get current professor data for file references
    const currentProfessor = await getProfessorById(id);
    if (!currentProfessor) {
      console.error(`Professor with id ${id} not found`);
      return null;
    }

    const updateData: any = { ...updates };

    // Handle email screenshot upload/replacement
    if (emailScreenshot) {
      // Delete old file if exists
      if (currentProfessor.email_screenshot?.url) {
        await deleteFile('professors', currentProfessor.email_screenshot.url);
      }
      
      // Upload new file
      const emailScreenshotUrl = await uploadFile('professors', 'email-screenshots', emailScreenshot);
      if (emailScreenshotUrl) {
        updateData.email_screenshot = { url: emailScreenshotUrl };
      }
    }

    // Handle proposal PDF upload/replacement
    if (proposalPdf) {
      // Delete old file if exists
      if (currentProfessor.proposal?.url) {
        await deleteFile('professors', currentProfessor.proposal.url);
      }
      
      // Upload new file
      const proposalPdfUrl = await uploadFile('professors', 'proposals', proposalPdf);
      if (proposalPdfUrl) {
        updateData.proposal = { url: proposalPdfUrl };
      }
    }

    // Update professor record
    const { data, error } = await supabase
      .from('professors')
      .update(updateData)
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
    // Get professor data for file cleanup
    const professor = await getProfessorById(id);
    if (!professor) {
      console.error(`Professor with id ${id} not found`);
      return false;
    }

    // Delete associated files
    if (professor.email_screenshot?.url) {
      await deleteFile('professors', professor.email_screenshot.url);
    }
    
    if (professor.proposal?.url) {
      await deleteFile('professors', professor.proposal.url);
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