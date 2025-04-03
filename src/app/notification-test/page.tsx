// src/app/notification-test/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  RefreshCw, 
  Bell, 
  Database, 
  Check, 
  AlertTriangle, 
  Send, 
  Settings, 
  User, 
  Calendar,
  Save
} from 'lucide-react';

// Default user ID - in a real app with authentication, this would come from the auth context
const DEFAULT_USER_ID = '1';

export default function NotificationTestPage() {
  const [loading, setLoading] = useState(false);
  const [stepResults, setStepResults] = useState<Record<string, any>>({});
  const [selectedProfessor, setSelectedProfessor] = useState<string>('');
  const [professors, setProfessors] = useState<any[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<any>(null);
  const [settingsInput, setSettingsInput] = useState({
    email_notifications: true,
    sms_notifications: false,
    phone_number: '',
    reminder_days: 7,
    followup_message_template: 'Time to follow up with {name} from {university}.',
    status_update_template: 'Status update for {name}: {status}'
  });

  // Function to fetch professors
  const fetchProfessors = async () => {
    try {
      runStep('fetchProfessors', async () => {
        const { data, error } = await supabase
          .from('professors')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        setProfessors(data || []);
        return { success: true, data };
      });
    } catch (error) {
      console.error('Error fetching professors:', error);
    }
  };

  // Function to fetch notification settings
  const fetchNotificationSettings = async () => {
    try {
      runStep('fetchSettings', async () => {
        // Check if the notification_settings table exists
        const { error: tableCheckError } = await supabase
          .from('notification_settings')
          .select('*', { count: 'exact', head: true });
        
        // If there's an error and it might be because the table doesn't exist
        if (tableCheckError) {
          return { 
            success: false, 
            tableExists: false, 
            error: tableCheckError
          };
        }
        
        // Table exists, try to get settings
        const { data, error } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', DEFAULT_USER_ID)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          return { 
            success: false, 
            tableExists: true, 
            settingsExist: false, 
            error 
          };
        }
        
        if (data) {
          setNotificationSettings(data);
          setSettingsInput({
            email_notifications: data.email_notifications ?? true,
            sms_notifications: data.sms_notifications ?? false,
            phone_number: data.phone_number || '',
            reminder_days: data.reminder_days || 7,
            followup_message_template: data.followup_message_template || 'Time to follow up with {name} from {university}.',
            status_update_template: data.status_update_template || 'Status update for {name}: {status}'
          });
          
          return { 
            success: true, 
            tableExists: true, 
            settingsExist: true, 
            data 
          };
        }
        
        return { 
          success: true, 
          tableExists: true, 
          settingsExist: false, 
          data: null 
        };
      });
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  // Function to create notification_settings table
  const createSettingsTable = async () => {
    try {
      runStep('createSettingsTable', async () => {
        // Using RPC to create the table
        const { data, error } = await supabase.rpc('create_notification_settings_table');
        
        if (error) throw error;
        
        // Refresh settings after creating the table
        await fetchNotificationSettings();
        
        return { success: true };
      });
    } catch (error) {
      console.error('Error creating settings table:', error);
    }
  };

  // Function to save notification settings
  const saveNotificationSettings = async () => {
    try {
      runStep('saveSettings', async () => {
        // Check if settings exist
        const { data: existingSettings } = await supabase
          .from('notification_settings')
          .select('id')
          .eq('user_id', DEFAULT_USER_ID)
          .maybeSingle();
        
        if (existingSettings) {
          // Update existing settings
          const { data, error } = await supabase
            .from('notification_settings')
            .update({
              email_notifications: settingsInput.email_notifications,
              sms_notifications: settingsInput.sms_notifications,
              phone_number: settingsInput.phone_number,
              reminder_days: settingsInput.reminder_days,
              followup_message_template: settingsInput.followup_message_template,
              status_update_template: settingsInput.status_update_template,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSettings.id)
            .select();
            
          if (error) throw error;
          
          setNotificationSettings(data?.[0]);
          return { success: true, operation: 'update', data };
        } else {
          // Create new settings
          const { data, error } = await supabase
            .from('notification_settings')
            .insert({
              user_id: DEFAULT_USER_ID,
              email_notifications: settingsInput.email_notifications,
              sms_notifications: settingsInput.sms_notifications,
              phone_number: settingsInput.phone_number,
              reminder_days: settingsInput.reminder_days,
              followup_message_template: settingsInput.followup_message_template,
              status_update_template: settingsInput.status_update_template
            })
            .select();
            
          if (error) throw error;
          
          setNotificationSettings(data?.[0]);
          return { success: true, operation: 'insert', data };
        }
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  // Function to send a manual notification to a professor
  const sendManualNotification = async () => {
    if (!selectedProfessor) {
      alert('Please select a professor first');
      return;
    }
    
    try {
      runStep('sendNotification', async () => {
        // Get the professor
        const { data: professor, error: professorError } = await supabase
          .from('professors')
          .select('*')
          .eq('id', selectedProfessor)
          .single();
          
        if (professorError) throw professorError;
        
        // Prepare the message with placeholder replacements
        const message = settingsInput.followup_message_template
          .replace('{name}', professor.name)
          .replace('{university}', professor.university_name || 'university')
          .replace('{status}', professor.status || 'pending');
        
        // 1. Update professor's notification timestamp
        const { error: updateError } = await supabase
          .from('professors')
          .update({
            status: 'Follow Up',
            last_notification_sent_at: new Date().toISOString()
          })
          .eq('id', selectedProfessor);
          
        if (updateError) throw updateError;
        
        // 2. Record notification in history
        const { data: historyData, error: historyError } = await supabase
          .from('notification_history')
          .insert({
            user_id: DEFAULT_USER_ID,
            professor_id: selectedProfessor,
            notification_type: 'manual',
            message: message,
            status: 'sent'
          })
          .select();
          
        if (historyError) {
          // Try to create the table if it doesn't exist
          await supabase.rpc('create_notification_history_table');
          
          // Try again
          const { data: retryData, error: retryError } = await supabase
            .from('notification_history')
            .insert({
              user_id: DEFAULT_USER_ID,
              professor_id: selectedProfessor,
              notification_type: 'manual',
              message: message,
              status: 'sent'
            })
            .select();
            
          if (retryError) throw retryError;
        }
        
        // Refresh the professor list
        await fetchProfessors();
        
        return { 
          success: true, 
          message, 
          professor
        };
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Function to check professors needing reminders
  const checkReminders = async () => {
    try {
      runStep('checkReminders', async () => {
        // Get reminder days setting
        const reminderDays = notificationSettings?.reminder_days || 7;
        
        // Calculate the date that was 'reminderDays' ago
        const today = new Date();
        const reminderDate = new Date();
        reminderDate.setDate(today.getDate() - reminderDays);
        const reminderDateStr = reminderDate.toISOString().split('T')[0];
        
        // Find professors that were emailed 'reminderDays' ago with status still 'Pending'
        const { data, error, count } = await supabase
          .from('professors')
          .select('*', { count: 'exact' })
          .eq('status', 'Pending')
          .lte('email_date', reminderDateStr)
          .is('last_notification_sent_at', null);
          
        if (error) throw error;
        
        return { 
          success: true, 
          count: count || 0,
          reminderDate: reminderDateStr,
          reminderDays,
          data: data?.slice(0, 5) || [] // Just return first 5 for display
        };
      });
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  };

  // Utility function to run a step with loading and error handling
  const runStep = async (stepName: string, callback: () => Promise<any>) => {
    setLoading(true);
    try {
      setStepResults(prev => ({
        ...prev,
        [stepName]: { loading: true }
      }));
      
      const result = await callback();
      
      setStepResults(prev => ({
        ...prev,
        [stepName]: { loading: false, ...result }
      }));
      
      return result;
    } catch (error: any) {
      setStepResults(prev => ({
        ...prev,
        [stepName]: { 
          loading: false, 
          success: false, 
          error: { 
            message: error.message, 
            name: error.name,
            // Include additional error details if available
            code: error.code, 
            details: error.details, 
            hint: error.hint
          } 
        }
      }));
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Run initial checks when the component mounts
  useEffect(() => {
    const init = async () => {
      await fetchProfessors();
      await fetchNotificationSettings();
    };
    
    init();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Notification System Test</h1>
      <p className="text-gray-600 mb-6">This simple test page will help you identify issues with notifications and step through the process.</p>

      <div className="flex flex-wrap gap-4 mb-6">
        <button 
          onClick={fetchNotificationSettings}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center gap-2"
        >
          <Settings size={16} />
          Check Settings
        </button>
        
        <button 
          onClick={fetchProfessors}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center gap-2"
        >
          <User size={16} />
          Fetch Professors
        </button>
        
        <button 
          onClick={checkReminders}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center gap-2"
        >
          <Calendar size={16} />
          Check Reminders
        </button>
        
        {!stepResults.fetchSettings?.tableExists && (
          <button 
            onClick={createSettingsTable}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 flex items-center gap-2"
          >
            <Database size={16} />
            Create Settings Table
          </button>
        )}
      </div>
      
      {/* Notification Settings Section */}
      <div className="mb-8 p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Bell size={20} className="text-indigo-500" />
          Notification Settings
        </h2>
        
        {stepResults.fetchSettings?.success === false && (
          <div className="mb-4 p-4 bg-red-100 rounded-md text-red-800">
            <p className="font-bold">Error fetching settings:</p>
            <pre className="mt-2 text-sm overflow-auto">{JSON.stringify(stepResults.fetchSettings?.error, null, 2)}</pre>
          </div>
        )}
        
        <form onSubmit={(e) => { e.preventDefault(); saveNotificationSettings(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Notification Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive email notifications for reminders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settingsInput.email_notifications}
                  onChange={(e) => setSettingsInput(prev => ({...prev, email_notifications: e.target.checked}))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* SMS Notification Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive SMS notifications for reminders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settingsInput.sms_notifications}
                  onChange={(e) => setSettingsInput(prev => ({...prev, sms_notifications: e.target.checked}))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            {/* Phone Number */}
            <div className={settingsInput.sms_notifications ? '' : 'opacity-50'}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={settingsInput.phone_number}
                onChange={(e) => setSettingsInput(prev => ({...prev, phone_number: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="+1234567890"
                disabled={!settingsInput.sms_notifications}
              />
              <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
            </div>
            
            {/* Reminder Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reminder Days
              </label>
              <select
                value={settingsInput.reminder_days}
                onChange={(e) => setSettingsInput(prev => ({...prev, reminder_days: parseInt(e.target.value)}))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="3">3 days</option>
                <option value="5">5 days</option>
                <option value="7">7 days</option>
                <option value="10">10 days</option>
                <option value="14">14 days</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Remind after this many days if no response received
              </p>
            </div>
          </div>
          
          {/* Message Templates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow-up Message Template
            </label>
            <textarea
              value={settingsInput.followup_message_template}
              onChange={(e) => setSettingsInput(prev => ({...prev, followup_message_template: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Template for follow-up messages"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {"{name}"} for professor name, {"{university}"} for university
            </p>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center gap-2"
            >
              <Save size={16} />
              Save Settings
            </button>
          </div>
        </form>
        
        {stepResults.saveSettings && (
          <div className={`mt-4 p-4 rounded-md ${stepResults.saveSettings.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p className="font-bold">{stepResults.saveSettings.success ? 'Settings saved successfully!' : 'Error saving settings'}</p>
            {stepResults.saveSettings.error && (
              <pre className="mt-2 text-sm overflow-auto">{JSON.stringify(stepResults.saveSettings.error, null, 2)}</pre>
            )}
          </div>
        )}
        
        {notificationSettings && (
          <div className="mt-4">
            <h3 className="font-bold text-sm mb-2">Current settings from database:</h3>
            <pre className="p-4 bg-gray-100 rounded-md text-sm overflow-auto">{JSON.stringify(notificationSettings, null, 2)}</pre>
          </div>
        )}
      </div>
      
      {/* Send Manual Notification Section */}
      <div className="mb-8 p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Send size={20} className="text-indigo-500" />
          Send Manual Notification
        </h2>
        
        {professors.length === 0 ? (
          <div className="p-4 bg-yellow-100 rounded-md text-yellow-800">
            No professors found. Please fetch professors first.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Professor to Notify
              </label>
              <select
                value={selectedProfessor}
                onChange={(e) => setSelectedProfessor(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Select a professor --</option>
                {professors.map(prof => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name} - {prof.university_name || 'Unknown'} ({prof.status || 'No status'})
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={sendManualNotification}
              disabled={loading || !selectedProfessor}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center gap-2"
            >
              <Send size={16} />
              Send Notification
            </button>
            
            {stepResults.sendNotification && (
              <div className={`mt-4 p-4 rounded-md ${stepResults.sendNotification.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <p className="font-bold">{stepResults.sendNotification.success ? 'Notification sent successfully!' : 'Error sending notification'}</p>
                {stepResults.sendNotification.success && (
                  <div className="mt-2">
                    <p><span className="font-medium">Message:</span> {stepResults.sendNotification.message}</p>
                  </div>
                )}
                {stepResults.sendNotification.error && (
                  <pre className="mt-2 text-sm overflow-auto">{JSON.stringify(stepResults.sendNotification.error, null, 2)}</pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Check Reminders Section */}
      {stepResults.checkReminders && (
        <div className="mb-8 p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-indigo-500" />
            Professors Needing Reminders
          </h2>
          
          <div className="mb-4 bg-gray-50 p-4 rounded-md">
            <p><span className="font-medium">Total professors needing reminders:</span> {stepResults.checkReminders.count}</p>
            <p><span className="font-medium">Reminder days setting:</span> {stepResults.checkReminders.reminderDays}</p>
            <p><span className="font-medium">Looking for emails sent on or before:</span> {stepResults.checkReminders.reminderDate}</p>
          </div>
          
          {stepResults.checkReminders.data && stepResults.checkReminders.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-md overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">University</th>
                    <th className="px-4 py-2 text-left">Email Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stepResults.checkReminders.data.map((prof: any) => (
                    <tr key={prof.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{prof.name}</td>
                      <td className="px-4 py-2">{prof.email}</td>
                      <td className="px-4 py-2">{prof.university_name || '-'}</td>
                      <td className="px-4 py-2">{prof.email_date || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 bg-green-100 rounded-md text-green-800">
              No professors currently need reminders
            </div>
          )}
        </div>
      )}
      
      {/* Raw Response Data */}
      <div className="mb-8 p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Database size={20} className="text-indigo-500" />
          Raw Response Data
        </h2>
        
        <div className="overflow-auto max-h-64">
          <pre className="p-4 bg-gray-100 rounded-md text-sm">{JSON.stringify(stepResults, null, 2)}</pre>
        </div>
      </div>