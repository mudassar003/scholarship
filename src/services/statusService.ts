// src/services/statusService.ts
import { supabase } from '@/lib/supabase';
import { getNotificationSettings } from './notificationService';
import { Professor } from '@/types';

/**
 * Updates the status of a professor
 * @param professorId The ID of the professor to update
 * @param newStatus The new status value
 * @returns True if successful, false otherwise
 */
export const updateProfessorStatus = async (
  professorId: string,
  newStatus: string
): Promise<boolean> => {
  try {
    // Get notification settings for default reminder days
    const settings = await getNotificationSettings();
    const defaultReminderDays = settings?.reminder_days || 7;
    
    // Get the current date for updates
    const today = new Date().toISOString().split('T')[0];
    
    // Prepare update data
    const updateData: Partial<Professor> = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    
    // Add additional fields based on status
    if (newStatus === 'Replied') {
      updateData.reply_date = today;
      updateData.notification_enabled = false; // Turn off notifications for replied emails
    } else if (newStatus === 'Pending') {
      // Set a reminder date for followup after the default number of days
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + defaultReminderDays);
      updateData.reminder_date = reminderDate.toISOString().split('T')[0];
      updateData.notification_enabled = true;
    } else if (newStatus === 'Follow Up') {
      // Set a reminder date for one week from now
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + 7);
      updateData.reminder_date = reminderDate.toISOString().split('T')[0];
      updateData.notification_enabled = true;
    } else if (newStatus === 'Scheduled') {
      // Scheduled status implies there will be a future meeting/call
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + 3); // Reminder 3 days before scheduled event
      updateData.reminder_date = reminderDate.toISOString().split('T')[0];
      updateData.notification_enabled = true;
    } else if (newStatus === 'No Response') {
      // If no response after 2 weeks, mark for follow-up
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + 14);
      updateData.reminder_date = reminderDate.toISOString().split('T')[0];
      updateData.notification_enabled = true;
    } else if (newStatus === 'Rejected') {
      // For rejected emails, disable notifications
      updateData.notification_enabled = false;
    }
    
    // Update the professor record
    const { error } = await supabase
      .from('professors')
      .update(updateData)
      .eq('id', professorId);
    
    if (error) {
      console.error('Error updating professor status:', error);
      return false;
    }
    
    // Log the status change for future notification system
    console.log(`Professor ${professorId} status updated to ${newStatus}`);
    
    return true;
  } catch (error) {
    console.error('Error in updateProfessorStatus:', error);
    return false;
  }
};

/**
 * Updates the status and additional details of a professor
 * @param professorId The ID of the professor to update
 * @param updates Object containing status, reminderDate, and notes
 * @returns True if successful, false otherwise
 */
export const updateProfessorDetails = async (
  professorId: string, 
  updates: { 
    status: string, 
    reminderDate?: string, 
    notes?: string 
  }
): Promise<boolean> => {
  try {
    // Prepare update data
    const updateData: Partial<Professor> = {
      status: updates.status,
      updated_at: new Date().toISOString()
    };
    
    // Add reminder date if provided
    if (updates.reminderDate) {
      updateData.reminder_date = updates.reminderDate;
      updateData.notification_enabled = true;
    } else {
      // If no custom reminder date, set based on status
      await updateProfessorStatus(professorId, updates.status);
      return true;
    }
    
    // Add notes if provided
    if (updates.notes) {
      updateData.notes = updates.notes;
    }
    
    // Update the professor record
    const { error } = await supabase
      .from('professors')
      .update(updateData)
      .eq('id', professorId);
    
    if (error) {
      console.error('Error updating professor details:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateProfessorDetails:', error);
    return false;
  }
};

/**
 * Gets all professors with upcoming reminders
 * @returns Array of professors with reminder dates coming up
 */
export const getProfessorsWithUpcomingReminders = async (): Promise<Professor[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get professors with reminders today or in the past that haven't been notified yet
    const { data, error } = await supabase
      .from('professors')
      .select('*')
      .eq('notification_enabled', true)
      .lte('reminder_date', today)
      .is('last_notification_sent_at', null);
    
    if (error) {
      console.error('Error fetching professors with reminders:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getProfessorsWithUpcomingReminders:', error);
    return [];
  }
};

/**
 * Marks a reminder as sent
 * @param professorId The ID of the professor to update
 * @returns True if successful, false otherwise
 */
export const markReminderAsSent = async (professorId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('professors')
      .update({
        last_notification_sent_at: new Date().toISOString()
      })
      .eq('id', professorId);
    
    if (error) {
      console.error('Error marking reminder as sent:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in markReminderAsSent:', error);
    return false;
  }
};

/**
 * Updates status with notes
 * @param professorId Professor ID
 * @param status New status
 * @param notes Additional notes
 * @returns True if successful
 */
export const updateStatusWithNotes = async (
  professorId: string,
  status: string,
  notes?: string
): Promise<boolean> => {
  try {
    // First update the status which will set appropriate reminders
    const statusUpdated = await updateProfessorStatus(professorId, status);
    
    if (!statusUpdated) {
      return false;
    }
    
    // If notes provided, update them separately
    if (notes) {
      const { error } = await supabase
        .from('professors')
        .update({ notes })
        .eq('id', professorId);
      
      if (error) {
        console.error('Error updating professor notes:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateStatusWithNotes:', error);
    return false;
  }
};