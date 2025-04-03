// src/services/notificationService.ts
import { supabase } from '@/lib/supabase';
import { Professor } from '@/types';

// Default user ID - in a real app with authentication, this would come from the auth context
const DEFAULT_USER_ID = '1';

/**
 * Fetches notification settings for the current user
 */
export const getNotificationSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', DEFAULT_USER_ID)
      .single();
    
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
 * Gets professors that need followup reminders
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
    
    // Find professors that were emailed 'reminderDays' ago with status still 'Pending'
    const { data, error } = await supabase
      .from('professors')
      .select('*')
      .eq('status', 'Pending')
      .eq('email_date', reminderDateStr)
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
        // WhatsApp notification
        if (settings.sms_notifications && settings.phone_number) {
          // Default message if template is not set
          const message = settings.followup_message_template || 
            'Time to follow up with {name} from {university}. No response received after 7 days.';
          
          const success = await sendWhatsAppNotification(professor, message);
          if (success) {
            successCount++;
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
          successCount++;
        }
        
        // Update the professor status to 'Follow Up' automatically
        await supabase
          .from('professors')
          .update({
            status: 'Follow Up'
          })
          .eq('id', professor.id);
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
    
    // Update professor status to 'Follow Up'
    await supabase
      .from('professors')
      .update({
        status: 'Follow Up',
        last_notification_sent_at: new Date().toISOString()
      })
      .eq('id', professorId);
    
    return success;
  } catch (error) {
    console.error('Error sending manual followup reminder:', error);
    return false;
  }
};