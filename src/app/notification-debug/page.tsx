// src/app/notification-debug/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const DEFAULT_USER_ID = '1';

export default function NotificationDebugPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [remindableCount, setRemindableCount] = useState(0);
  const [testResult, setTestResult] = useState<any>(null);
  const [dbTables, setDbTables] = useState<string[]>([]);

  // Step 1: Check database connection
  const checkDbConnection = async () => {
    setLoading(true);
    try {
      const { data, error, status } = await supabase.from('professors').select('count', { count: 'exact', head: true });
      
      return {
        success: !error,
        status,
        error: error ? { message: error.message, code: error.code, details: error.details } : null,
        data
      };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err.message, name: err.name },
        status: 'exception'
      };
    } finally {
      setLoading(false);
    }
  };

  // Step 2: List all database tables (to check if notification_settings exists)
  const listDbTables = async () => {
    try {
      // Using raw SQL query to get table names
      const { data, error } = await supabase.rpc('get_all_tables');
      
      if (!error && data) {
        setDbTables(data);
      }
      
      return {
        success: !error,
        error: error ? { message: error.message, code: error.code, details: error.details } : null,
        data
      };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err.message, name: err.name }
      };
    }
  };

  // Step 3: Check if notification_settings table exists
  const checkNotificationTable = async () => {
    try {
      // Try a simple count query to check if table exists
      const { data, error, status } = await supabase
        .from('notification_settings')
        .select('count', { count: 'exact', head: true });
      
      return {
        exists: !error || (error && error.code !== 'PGRST109'),
        status,
        error: error ? { message: error.message, code: error.code, details: error.details } : null,
        data
      };
    } catch (err: any) {
      return {
        exists: false,
        error: { message: err.message, name: err.name }
      };
    }
  };

  // Step 4: Check if settings exist for the current user
  const checkUserSettings = async () => {
    try {
      const { data, error, status } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .maybeSingle();
      
      if (data) {
        setSettings(data);
      }
      
      return {
        exists: !!data,
        status,
        error: error ? { message: error.message, code: error.code, details: error.details } : null,
        data
      };
    } catch (err: any) {
      return {
        exists: false,
        error: { message: err.message, name: err.name }
      };
    }
  };

  // Step 5: Create notification_settings table if it doesn't exist
  const createNotificationTable = async () => {
    try {
      // SQL query to create the table (note: this would normally be done via migrations)
      const { data, error } = await supabase.rpc('create_notification_settings_table');
      
      return {
        success: !error,
        error: error ? { message: error.message, code: error.code, details: error.details } : null,
        data
      };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err.message, name: err.name }
      };
    }
  };

  // Step 6: Create default settings for the user
  const createDefaultSettings = async () => {
    try {
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
      
      const { data, error } = await supabase
        .from('notification_settings')
        .insert(defaultSettings)
        .select()
        .single();
      
      if (data) {
        setSettings(data);
      }
      
      return {
        success: !error,
        error: error ? { message: error.message, code: error.code, details: error.details } : null,
        data
      };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err.message, name: err.name }
      };
    }
  };

  // Step 7: Get count of professors needing reminders
  const getProfessorsForReminder = async () => {
    try {
      // Get current reminder days setting
      const reminderDays = settings?.reminder_days || 7;
      
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
      
      if (data) {
        setRemindableCount(data.length);
      }
      
      return {
        success: !error,
        count: count || 0,
        error: error ? { message: error.message, code: error.code, details: error.details } : null,
        data: data ? data.slice(0, 5) : [] // Just return first 5 for display purposes
      };
    } catch (err: any) {
      return {
        success: false,
        count: 0,
        error: { message: err.message, name: err.name },
        data: []
      };
    }
  };

  // Function to run all checks
  const runAllChecks = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);
    
    const results: any = {};
    
    try {
      // Step 1: Check DB connection
      results.dbConnection = await checkDbConnection();
      
      // Step 2: List all tables
      results.tables = await listDbTables();
      
      // Step 3: Check if notification_settings table exists
      results.notificationTableExists = await checkNotificationTable();
      
      // Step 4: Check if user settings exist
      results.userSettings = await checkUserSettings();
      
      // Step 5 & 6 are only executed if needed
      
      // Step 7: Check for professors needing reminders
      results.professorsForReminder = await getProfessorsForReminder();
      
      setTestResult(results);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Create notification_settings table
  const handleCreateNotificationTable = async () => {
    setLoading(true);
    try {
      const result = await createNotificationTable();
      setTestResult({ ...testResult, createTable: result });
      
      // Refresh the table list and checks
      await listDbTables();
      await checkNotificationTable();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Create default settings for the user
  const handleCreateDefaultSettings = async () => {
    setLoading(true);
    try {
      const result = await createDefaultSettings();
      setTestResult({ ...testResult, createSettings: result });
      
      // Refresh user settings check
      await checkUserSettings();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAllChecks();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Notification System Debugger</h1>
      
      <div className="mb-4 flex space-x-4">
        <button 
          onClick={runAllChecks}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
        >
          {loading ? 'Running...' : 'Run All Checks'}
        </button>
        
        {testResult?.notificationTableExists && !testResult.notificationTableExists.exists && (
          <button 
            onClick={handleCreateNotificationTable}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
          >
            Create notification_settings Table
          </button>
        )}
        
        {(!testResult?.userSettings?.exists && testResult?.notificationTableExists?.exists) && (
          <button 
            onClick={handleCreateDefaultSettings}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            Create Default Settings
          </button>
        )}
      </div>
      
      {/* Display status summary */}
      {testResult && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-md ${testResult.dbConnection?.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <h3 className="font-bold">Database Connection</h3>
            <p>{testResult.dbConnection?.success ? 'Connected' : 'Failed'}</p>
          </div>
          
          <div className={`p-4 rounded-md ${testResult.notificationTableExists?.exists ? 'bg-green-100' : 'bg-yellow-100'}`}>
            <h3 className="font-bold">notification_settings Table</h3>
            <p>{testResult.notificationTableExists?.exists ? 'Exists' : 'Does not exist'}</p>
          </div>
          
          <div className={`p-4 rounded-md ${testResult.userSettings?.exists ? 'bg-green-100' : 'bg-yellow-100'}`}>
            <h3 className="font-bold">User Settings</h3>
            <p>{testResult.userSettings?.exists ? 'Exists' : 'Not found'}</p>
          </div>
          
          <div className={`p-4 rounded-md ${testResult.professorsForReminder?.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <h3 className="font-bold">Professors Needing Reminders</h3>
            <p>{testResult.professorsForReminder?.count || 0} professors</p>
          </div>
        </div>
      )}
      
      {/* Show SQL Tables */}
      {dbTables.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Database Tables</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {dbTables.map(table => (
                <li key={table} className="p-2 bg-white rounded">
                  {table} {table === 'notification_settings' && '✓'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Show current notification settings */}
      {settings && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Current Notification Settings</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <pre className="overflow-auto text-sm">{JSON.stringify(settings, null, 2)}</pre>
          </div>
        </div>
      )}
      
      {/* Show professors needing reminders */}
      {testResult?.professorsForReminder?.data?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Professors Needing Reminders ({testResult.professorsForReminder.count} total)</h2>
          <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left px-4 py-2">Name</th>
                  <th className="text-left px-4 py-2">Email</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-left px-4 py-2">Email Date</th>
                </tr>
              </thead>
              <tbody>
                {testResult.professorsForReminder.data.map((prof: any) => (
                  <tr key={prof.id} className="bg-white">
                    <td className="px-4 py-2">{prof.name}</td>
                    <td className="px-4 py-2">{prof.email}</td>
                    <td className="px-4 py-2">{prof.status}</td>
                    <td className="px-4 py-2">{prof.email_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {testResult.professorsForReminder.count > 5 && (
              <p className="mt-2 text-gray-600">Showing 5 of {testResult.professorsForReminder.count} professors</p>
            )}
          </div>
        </div>
      )}
      
      {/* Show detailed results */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Detailed Test Results</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <pre className="overflow-auto text-sm h-64">{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      </div>
      
      {/* Show any errors */}
      {error && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 text-red-600">Error</h2>
          <div className="bg-red-100 p-4 rounded-md">
            <pre className="overflow-auto text-sm">{JSON.stringify(error, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}