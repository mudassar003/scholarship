// src/services/simpleNotificationService.ts
import { supabase } from '@/lib/supabase';
import { Professor } from '@/types';

// Default user ID - in a real app, this would come from authentication
const DEFAULT_USER_ID = '1';

/**
 * Gets notification settings for the current user
 */
export const getNotificationSettings = async () => {
  try {
    // First check if the settings table exists
    try {
      // Try to query the table to see if it exists
      const { error } = await supabase
        .from('notification_settings')
        .select('count', { count: 'exact', head: true });
      
      // If we get an error that indicates the table doesn't exist
      if (error && error.code === 'PGRST109') {
        console.log('notification_settings table does not exist');
        return null;
      }
    } catch (checkError) {
      console.error('Error checking if notification_settings table exists:', checkError);
      return null;
    }
    
    // Table exists, try to get settings
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', DEFAULT_USER_ID)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching notification settings:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getNotificationSettings:', error);
    return null;
  }
};

/**
 * Creates or updates notification settings
 */
export const saveNotificationSettings = async (settings: any) => {
  try {
    // Check if settings exist
    const { data: existingSettings, error: checkError } = await supabase
      .from('notification_settings')
      .select('id')
      .eq('user_id', DEFAULT_USER_ID)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing settings:', checkError);
      return null;
    }
    
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('notification_settings')
        .update({
          email_notifications: settings.email_notifications,
          sms_notifications: settings.sms_notifications,
          phone_number: settings.phone_number,
          reminder_days: settings.reminder_days,
          followup_message_template: settings.followup_message_template,
          status_update_template: settings.status_update_template,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating notification settings:', error);
        return null;
      }
      
      return data;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('notification_settings')
        .insert({
          user_id: DEFAULT_USER_ID,
          email_notifications: settings.email_notifications,
          sms_notifications: settings.sms_notifications,
          phone_number: settings.phone_number,
          reminder_days: settings.reminder_days,
          followup_message_template: settings.followup_message_template,
          status_update_template: settings.status_update_template
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating notification settings:', error);
        return null;
      }
      
      return data;
    }
  } catch (error) {
    console.error('Error in saveNotificationSettings:', error);
    return null;
  }
};

/**
 * Gets professors that need followup reminders
 */
export const getProfessorsForReminder = async () => {
  try {
    // Get settings to determine reminder days
    const settings = await getNotificationSettings();
    const reminderDays = settings?.reminder_days || 7; // Default to 7 days
    
    // Calculate the date that was 'reminderDays' ago
    const today = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(today.getDate() - reminderDays);
    const reminderDateStr = reminderDate.toISOString().split('T')[0];
    
    // Find professors that were emailed 'reminderDays' ago with status still 'Pending'
    const { data, error } = await supabase
      .from('professors')
      .select('*')
      .eq('status', 'Pending')
      .lte('email_date', reminderDateStr)
      .is('last_notification_sent_at', null);
    
    if (error) {
      console.error('Error fetching professors for reminder:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getProfessorsForReminder:', error);
    return [];
  }
};

/**
 * Sends a manual notification to a professor
 */
export const sendManualNotification = async (professorId: string) => {
  try {
    // Get the professor
    const { data: professor, error: professorError } = await supabase
      .from('professors')
      .select('*')
      .eq('id', professorId)
      .single();
      
    if (professorError) {
      console.error('Error fetching professor:', professorError);
      return false;
    }
    
    // Get notification settings
    const settings = await getNotificationSettings();
    if (!settings) {
      console.error('No notification settings found');
      return false;
    }
    
    // Format the message
    const message = settings.followup_message_template
      .replace('{name}', professor.name)
      .replace('{university}', professor.university_name || 'university')
      .replace('{status}', professor.status || 'pending');
    
    // Record the notification
    try {
      const { error: historyError } = await supabase
        .from('notification_history')
        .insert({
          user_id: DEFAULT_USER_ID,
          professor_id: professorId,
          notification_type: 'manual',
          message: message,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
      
      if (historyError) {
        console.error('Error recording notification:', historyError);
        // Continue anyway - this is not critical
      }
    } catch (historyError) {
      console.error('Error in notification history:', historyError);
      // Continue anyway
    }
    
    // Update the professor's status and timestamp
    const { error: updateError } = await supabase
      .from('professors')
      .update({
        status: 'Follow Up',
        last_notification_sent_at: new Date().toISOString()
      })
      .eq('id', professorId);
      
    if (updateError) {
      console.error('Error updating professor:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in sendManualNotification:', error);
    return false;
  }
};

/**
 * Process all professors needing reminders and send notifications
 */
export const processFollowupReminders = async () => {
  try {
    const professors = await getProfessorsForReminder();
    console.log(`Found ${professors.length} professors needing reminders`);
    
    if (professors.length === 0) {
      return { success: true, count: 0 };
    }
    
    // Get notification settings
    const settings = await getNotificationSettings();
    if (!settings) {
      console.error('No notification settings found');
      return { success: false, error: 'No notification settings found' };
    }
    
    // Process each professor
    let successCount = 0;
    
    for (const professor of professors) {
      try {
        // Update the professor status to 'Follow Up'
        const { error: updateError } = await supabase
          .from('professors')
          .update({
            status: 'Follow Up',
            last_notification_sent_at: new Date().toISOString()
          })
          .eq('id', professor.id);
          
        if (updateError) {
          console.error(`Error updating professor ${professor.id}:`, updateError);
          continue;
        }
        
        // Record notification in history
        try {
          // Format the message
          const message = settings.followup_message_template
            .replace('{name}', professor.name)
            .replace('{university}', professor.university_name || 'university')
            .replace('{status}', professor.status || 'pending');
          
          await supabase
            .from('notification_history')
            .insert({
              user_id: DEFAULT_USER_ID,
              professor_id: professor.id,
              notification_type: 'auto',
              message: message,
              status: 'sent',
              sent_at: new Date().toISOString()
            });
        } catch (historyError) {
          console.error('Error recording notification history:', historyError);
          // Continue anyway
        }
        
        successCount++;
      } catch (error) {
        console.error(`Error processing professor ${professor.id}:`, error);
      }
    }
    
    return { success: true, count: successCount, total: professors.length };
  } catch (error) {
    console.error('Error in processFollowupReminders:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};