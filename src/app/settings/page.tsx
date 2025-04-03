//src/app/settings/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Bell, Mail, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

// Default user ID - in a real app, this would come from authentication
const DEFAULT_USER_ID = '1';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    phone_number: '',
    reminder_days: 7, // Default to 7 days for followup
    followup_message_template: 'Dear Professor, I wanted to follow up on my previous email regarding the scholarship opportunity.',
    status_update_template: 'Professor {name} from {university} has a status update: {status}'
  });

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try to get existing settings
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error fetching settings:', error);
        toast.error('Failed to load notification settings');
      } else if (data) {
        // If settings exist, use them
        setSettings({
          ...settings,
          email_notifications: data.email_notifications,
          sms_notifications: data.sms_notifications,
          phone_number: data.phone_number || '',
          reminder_days: data.reminder_days || 7,
          followup_message_template: data.followup_message_template || settings.followup_message_template,
          status_update_template: data.status_update_template || settings.status_update_template
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [settings]); // Include settings in dependencies

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Check if settings exist
      const { data: existingSettings, error: checkError } = await supabase
        .from('notification_settings')
        .select('id')
        .eq('user_id', DEFAULT_USER_ID)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking settings:', checkError);
        toast.error('Failed to save settings');
        return;
      }

      if (existingSettings) {
        // Update existing settings
        const { error: updateError } = await supabase
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
          .eq('id', existingSettings.id);

        if (updateError) {
          console.error('Error updating settings:', updateError);
          toast.error('Failed to update settings');
          return;
        }
      } else {
        // Create new settings
        const { error: insertError } = await supabase
          .from('notification_settings')
          .insert({
            user_id: DEFAULT_USER_ID,
            email_notifications: settings.email_notifications,
            sms_notifications: settings.sms_notifications,
            phone_number: settings.phone_number,
            reminder_days: settings.reminder_days,
            followup_message_template: settings.followup_message_template,
            status_update_template: settings.status_update_template
          });

        if (insertError) {
          console.error('Error creating settings:', insertError);
          toast.error('Failed to save settings');
          return;
        }
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An error occurred while saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800">Notification Settings</h1>
        <p className="text-neutral-600 mt-2">
          Configure how you want to be notified about professor email status changes and reminders.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={saveSettings} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Notification Methods */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-neutral-800 flex items-center gap-2">
                  <Bell size={20} className="text-indigo-500" />
                  Notification Methods
                </h2>
                
                {/* Email Notification Toggle */}
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-neutral-700" />
                    <div>
                      <p className="font-medium text-neutral-800">Email Notifications</p>
                      <p className="text-sm text-neutral-600">Receive email notifications for reminders</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.email_notifications}
                      onChange={(e) => setSettings(prev => ({...prev, email_notifications: e.target.checked}))}
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* WhatsApp Notification Toggle */}
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-neutral-700" />
                    <div>
                      <p className="font-medium text-neutral-800">WhatsApp Notifications</p>
                      <p className="text-sm text-neutral-600">Receive WhatsApp notifications for reminders</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.sms_notifications}
                      onChange={(e) => setSettings(prev => ({...prev, sms_notifications: e.target.checked}))}
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Phone Number */}
                <div className={`transition-all duration-300 ${settings.sms_notifications ? 'opacity-100' : 'opacity-50'}`}>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-neutral-700 mb-1">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    value={settings.phone_number}
                    onChange={(e) => setSettings(prev => ({...prev, phone_number: e.target.value}))}
                    className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="+1234567890"
                    disabled={!settings.sms_notifications}
                  />
                  <p className="text-xs text-neutral-500 mt-1">Include country code (e.g., +1 for US)</p>
                </div>
              </div>

              {/* Reminder Settings */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-neutral-800 flex items-center gap-2">
                  <Bell size={20} className="text-indigo-500" />
                  Reminder Settings
                </h2>
                
                {/* Reminder Days */}
                <div>
                  <label htmlFor="reminder_days" className="block text-sm font-medium text-neutral-700 mb-1">
                    Follow-up Reminder Days
                  </label>
                  <select
                    id="reminder_days"
                    value={settings.reminder_days}
                    onChange={(e) => setSettings(prev => ({...prev, reminder_days: parseInt(e.target.value)}))}
                    className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="3">3 days</option>
                    <option value="5">5 days</option>
                    <option value="7">7 days</option>
                    <option value="10">10 days</option>
                    <option value="14">14 days</option>
                  </select>
                  <p className="text-xs text-neutral-500 mt-1">
                    Get notified if no response is received after this many days
                  </p>
                </div>

                {/* Message Templates */}
                <div>
                  <label htmlFor="followup_template" className="block text-sm font-medium text-neutral-700 mb-1">
                    Follow-up Message Template
                  </label>
                  <textarea
                    id="followup_template"
                    value={settings.followup_message_template}
                    onChange={(e) => setSettings(prev => ({...prev, followup_message_template: e.target.value}))}
                    className="w-full border border-neutral-300 rounded-lg px-4 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Template for follow-up messages"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Use {"{name}"} for professor name, {"{university}"} for university
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-neutral-200">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-sm transition-colors duration-300 ${
                  isSaving ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}