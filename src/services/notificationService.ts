// src/services/notificationService.ts (Fixed Version)
import { supabase } from '@/lib/supabase';
import { Professor } from '@/types';

// Default user ID - in a real app with authentication, this would come from the auth context
const DEFAULT_USER_ID = '1';

/**
 * Fetches notification settings for the current user
 */
export const getNotificationSettings = async () => {
  try {
    // First check if settings exist
    const { data: existingSettings, error: checkError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', DEFAULT_USER_ID)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for notification settings:', checkError);
      
      // Create default settings if not exists
      if (checkError.code === 'PGRST116') { // No rows returned
        const defaultSettings = {
          user_id: DEFAULT_USER_ID,
          email_notifications: true,
          sms_notifications: false,
          phone_number: '',
          phone_verified: false,
          reminder_days: 7,
          followup_message_template: 'Time to follow up with {name} from {university}.',
          status_update_template: 'Status update for {name}: {status}'
        };
        
        const { data: newSettings, error: insertError } = await supabase
          .from('notification_settings')
          .insert(defaultSettings)
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating default notification settings:', insertError);
          return null;
        }
        
        return newSettings;
      }
      
      return null;
    }
    
    return existingSettings;
  } catch (error) {
    console.error('Error in getNotificationSettings:', error);
    return null;
  }
};

/**
 * Gets professors that need followup reminders based on their email date and status
 */
export const getProfessorsForReminder = async () => {
  try {
    // Get current user's reminder settings
    const settings = await getNotificationSettings();
    const reminderDays = settings?.reminder_days || 7; // Default to 7 days if not set
    
    // Calculate the date that was 'reminderDays' ago
    const today = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(today.getDate() - reminderDays);
    const reminderDateStr = reminderDate.toISOString().split('T')[0];
    
    console.log(`Looking for professors emailed on or before ${reminderDateStr} with 'Pending' status`);
    
    // Find professors that were emailed 'reminderDays' ago with status still 'Pending'
    // Use <= for the date comparison to catch any that might have been missed
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
    
    console.log(`Found ${data?.length || 0} professors needing reminders`);
    return data || [];
  } catch (error) {
    console.error('Error in getProfessorsForReminder:', error);
    return [];
  }
};

/**
 * Records a notification in the notification history
 */
export const recordNotification = async (
  professorId: string,
  notificationType: string,
  message: string,
  status: string,
  errorMessage?: string
) => {
  try {
    // Check if the table exists first
    const { count, error: checkError } = await supabase
      .from('notification_history')
      .select('*', { count: 'exact', head: true });
    
    // If we get a specific error that might indicate the table doesn't exist
    if (checkError && (checkError.code === '42P01' || checkError.message.includes('does not exist'))) {
      console.error('notification_history table may not exist:', checkError);
      
      // Try to create the table (this would typically be done in a migration)
      try {
        await supabase.rpc('create_notification_history_table');
        console.log('Created notification_history table');
      } catch (createError) {
        console.error('Failed to create notification_history table:', createError);
        return false;
      }
    }
    
    const { error } = await supabase
      .from('notification_history')
      .insert({
        user_id: DEFAULT_USER_ID,
        professor_id: professorId,
        notification_type: notificationType,
        message: message,
        status: status,
        error_message: errorMessage,
        sent_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error recording notification:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in recordNotification:', error);
    return false;
  }
};

/**
 * Updates a professor's last notification timestamp
 */
export const updateProfessorNotificationTimestamp = async (professorId: string) => {
  try {
    const { error } = await supabase
      .from('professors')
      .update({
        last_notification_sent_at: new Date().toISOString()
      })
      .eq('id', professorId);
    
    if (error) {
      console.error('Error updating professor notification timestamp:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateProfessorNotificationTimestamp:', error);
    return false;
  }
};

/**
 * Sets the reminder date for a professor based on status
 */
export const setReminderDateForStatus = async (professorId: string, status: string) => {
  try {
    const today = new Date();
    let reminderDate = null;
    
    // Get user notification settings
    const settings = await getNotificationSettings();
    const reminderDays = settings?.reminder_days || 7;
    
    // Set reminder date based on status
    if (status === 'Pending') {
      // Reminder after X days from today for followup
      reminderDate = new Date();
      reminderDate.setDate(today.getDate() + reminderDays);
    } else if (status === 'Follow Up') {
      // Reminder after 3 days from follow up
      reminderDate = new Date();
      reminderDate.setDate(today.getDate() + 3);
    } else if (status === 'Scheduled') {
      // Reminder 1 day before scheduled date (would need additional field for scheduled date)
      reminderDate = new Date();
      reminderDate.setDate(today.getDate() + 1);
    }
    
    if (reminderDate) {
      const { error } = await supabase
        .from('professors')
        .update({
          reminder_date: reminderDate.toISOString().split('T')[0],
          notification_enabled: true
        })
        .eq('id', professorId);
      
      if (error) {
        console.error('Error setting reminder date:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in setReminderDateForStatus:', error);
    return false;
  }
};

/**
 * Sends a WhatsApp notification via Twilio
 * This is a placeholder - implement with actual Twilio SDK when ready
 */
export const sendWhatsAppNotification = async (professor: Professor, message: string) => {
  try {
    // Get notification settings
    const settings = await getNotificationSettings();
    
    if (!settings || !settings.sms_notifications) {
      console.log('SMS notifications disabled or no settings found');
      return false;
    }
    
    const phoneNumber = settings.phone_number;
    if (!phoneNumber) {
      console.error('No phone number set for WhatsApp notifications');
      return false;
    }
    
    // Format the message
    const formattedMessage = message
      .replace('{name}', professor.name)
      .replace('{university}', professor.university_name || 'university')
      .replace('{status}', professor.status || 'unknown');
    
    // Log the message - would actually send via Twilio in production
    console.log(`Would send WhatsApp to ${phoneNumber}: ${formattedMessage}`);
    
    // Record the notification
    await recordNotification(
      professor.id!,
      'whatsapp',
      formattedMessage,
      'sent'
    );
    
    // Update timestamp
    await updateProfessorNotificationTimestamp(professor.id!);
    
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    
    // Record the failed notification
    if (professor?.id) {
      await recordNotification(
        professor.id,
        'whatsapp',
        'Failed to send WhatsApp notification',
        'failed',
        error instanceof Error ? error.message : String(error)
      );
    }
    
    return false;
  }
};

/**
 * Main function that would run as a cron job to check for professors needing reminders
 * and send notifications via the user's preferred channels
 */
export const processFollowupReminders = async () => {
  try {
    // Get professors that need reminders
    const professors = await getProfessorsForReminder();
    console.log(`Found ${professors.length} professors needing followup reminders`);
    
    if (professors.length === 0) {
      return {
        success: true,
        message: 'No professors need reminders at this time',
        notificationsSent: 0,
        totalProfessors: 0
      };
    }
    
    // Get notification settings
    const settings = await getNotificationSettings();
    if (!settings) {
      console.error('No notification settings found');
      return {
        success: false,
        error: 'No notification settings found'
      };
    }
    
    // Counter for successful notifications
    let successCount = 0;
    
    // Process each professor
    for (const professor of professors) {
      try {
        // Create a flag to track if any notification method succeeded
        let notificationSent = false;
        
        // WhatsApp notification
        if (settings.sms_notifications && settings.phone_number) {
          // Default message if template is not set
          const message = settings.followup_message_template || 
            'Time to follow up with {name} from {university}. No response received after 7 days.';
          
          const success = await sendWhatsAppNotification(professor, message);
          if (success) {
            notificationSent = true;
          }
        }
        
        // Email notification - would implement similarly to WhatsApp
        // For now, just record it
        if (settings.email_notifications) {
          await recordNotification(
            professor.id!,
            'email',
            `Follow-up reminder for ${professor.name}`,
            'sent'
          );
          
          await updateProfessorNotificationTimestamp(professor.id!);
          notificationSent = true;
        }
        
        // Only count if at least one notification method succeeded
        if (notificationSent) {
          successCount++;
        }
        
        // Update the professor status to 'Follow Up' automatically
        const { error: updateError } = await supabase
          .from('professors')
          .update({
            status: 'Follow Up',
            last_notification_sent_at: new Date().toISOString()
          })
          .eq('id', professor.id);
          
        if (updateError) {
          console.error(`Error updating professor ${professor.id} status to Follow Up:`, updateError);
        }
      } catch (error) {
        console.error(`Error processing notifications for professor ${professor.id}:`, error);
      }
    }
    
    return {
      success: true,
      notificationsSent: successCount,
      totalProfessors: professors.length
    };
  } catch (error) {
    console.error('Error processing reminders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Function to manually trigger a follow-up reminder
 */
export const sendManualFollowupReminder = async (professorId: string) => {
  try {
    // Get professor data
    const { data: professor, error } = await supabase
      .from('professors')
      .select('*')
      .eq('id', professorId)
      .single();
    
    if (error) {
      console.error('Error fetching professor for manual reminder:', error);
      return false;
    }
    
    // Get notification settings
    const settings = await getNotificationSettings();
    if (!settings) {
      console.error('No notification settings found');
      return false;
    }
    
    // Send notifications
    let success = false;
    
    // WhatsApp notification
    if (settings.sms_notifications && settings.phone_number) {
      const message = settings.followup_message_template || 
        'Manual reminder to follow up with {name} from {university}';
      
      success = await sendWhatsAppNotification(professor, message);
    }
    
    // Email notification - would implement when needed
    if (settings.email_notifications) {
      await recordNotification(
        professorId,
        'email',
        `Manual follow-up reminder for ${professor.name}`,
        'sent'
      );
      success = true;
    }
    
    // Update professor status to 'Follow Up'
    const { error: updateError } = await supabase
      .from('professors')
      .update({
        status: 'Follow Up',
        last_notification_sent_at: new Date().toISOString()
      })
      .eq('id', professorId);
      
    if (updateError) {
      console.error('Error updating professor status for manual reminder:', updateError);
    }
    
    return success;
  } catch (error) {
    console.error('Error sending manual followup reminder:', error);
    return false;
  }
};

/**
 * SQL function to create notification history table if it doesn't exist
 * (Add this as a Supabase SQL function)
 */
/*
CREATE OR REPLACE FUNCTION create_notification_history_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS notification_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    professor_id UUID,
    notification_type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL,
    twilio_sid TEXT,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL
  );
END;
$$ LANGUAGE plpgsql;
*/