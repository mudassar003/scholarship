// src/components/NotificationDebugger.tsx
import React, { useState, useEffect } from 'react';
import { processFollowupReminders, getProfessorsForReminder, getNotificationSettings, sendManualFollowupReminder } from '@/services/notificationService';
import { updateProfessorStatus } from '@/services/statusService';
import { getProfessors } from '@/services/professorService';

const NotificationDebugger = () => {
  const [professors, setProfessors] = useState([]);
  const [remindableProfessors, setRemindableProfessors] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningCron, setIsRunningCron] = useState(false);
  const [cronResult, setCronResult] = useState(null);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get all professors
      const allProfessors = await getProfessors();
      setProfessors(allProfessors);

      // Get professors that need reminders
      const remindableProfs = await getProfessorsForReminder();
      setRemindableProfessors(remindableProfs);

      // Get notification settings
      const settings = await getNotificationSettings();
      setNotificationSettings(settings);
    } catch (error) {
      console.error("Error loading data:", error);
      addError(`Error loading data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runCronJob = async () => {
    setIsRunningCron(true);
    try {
      // Run the reminder process
      const result = await processFollowupReminders();
      setCronResult(result);
      
      // Refresh data
      await loadData();
    } catch (error) {
      console.error("Error running cron job:", error);
      addError(`Error running cron job: ${error.message}`);
    } finally {
      setIsRunningCron(false);
    }
  };

  const sendManualReminder = async (professorId) => {
    try {
      await sendManualFollowupReminder(professorId);
      await loadData();
    } catch (error) {
      console.error("Error sending manual reminder:", error);
      addError(`Error sending manual reminder: ${error.message}`);
    }
  };

  const updateStatus = async (professorId, newStatus) => {
    try {
      await updateProfessorStatus(professorId, newStatus);
      await loadData();
    } catch (error) {
      console.error("Error updating status:", error);
      addError(`Error updating status: ${error.message}`);
    }
  };

  const addError = (errorMessage) => {
    setErrors(prev => [...prev, { message: errorMessage, timestamp: new Date().toISOString() }]);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Notification System Debugger</h1>
        <p className="text-gray-600">Use this tool to debug notification cron jobs and process reminders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border shadow p-4">
          <h2 className="text-lg font-medium mb-2">Total Professors</h2>
          <p className="text-3xl font-bold">{professors.length}</p>
        </div>
        
        <div className="bg-white rounded-lg border shadow p-4">
          <h2 className="text-lg font-medium mb-2">Needing Reminders</h2>
          <p className="text-3xl font-bold text-amber-600">{remindableProfessors.length}</p>
        </div>
        
        <div className="bg-white rounded-lg border shadow p-4 flex flex-col justify-between">
          <h2 className="text-lg font-medium mb-2">Actions</h2>
          <div className="flex space-x-2">
            <button 
              onClick={loadData}
              className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              Refresh Data
            </button>
            <button 
              onClick={runCronJob}
              disabled={isRunningCron}
              className={`px-3 py-1 rounded-md text-white text-sm ${isRunningCron ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} transition-colors`}
            >
              {isRunningCron ? 'Running...' : 'Run Cron Job'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg border shadow">
          <div className="border-b p-4">
            <h2 className="text-lg font-medium">Notification Settings</h2>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-4">Loading settings...</div>
            ) : notificationSettings ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className={`text-sm ${notificationSettings.email_notifications ? 'text-green-600' : 'text-gray-500'}`}>
                      {notificationSettings.email_notifications ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">SMS Notifications</p>
                    <p className={`text-sm ${notificationSettings.sms_notifications ? 'text-green-600' : 'text-gray-500'}`}>
                      {notificationSettings.sms_notifications ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Phone Number</p>
                    <p className="text-sm text-gray-700">
                      {notificationSettings.phone_number || 'Not set'}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Reminder Days</p>
                    <p className="text-sm text-gray-700">{notificationSettings.reminder_days || 7} days</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium mb-1">Message Template</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    {notificationSettings.followup_message_template || 'No template set'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-amber-600">
                No notification settings found. Visit the Settings page to configure.
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border shadow">
          <div className="border-b p-4 flex justify-between items-center">
            <h2 className="text-lg font-medium">Professors Needing Reminders</h2>
            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
              {remindableProfessors.length} professors
            </span>
          </div>
          <div className="divide-y">
            {isLoading ? (
              <div className="text-center py-8">Loading professors...</div>
            ) : remindableProfessors.length > 0 ? (
              remindableProfessors.map(prof => (
                <div key={prof.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{prof.name}</h3>
                      <p className="text-sm text-gray-600">{prof.email}</p>
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      prof.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      prof.status === 'Replied' ? 'bg-green-100 text-green-800' :
                      prof.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {prof.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">University:</span> {prof.university_name || 'Unknown'}
                    </div>
                    <div>
                      <span className="text-gray-500">Email Date:</span> {prof.email_date ? new Date(prof.email_date).toLocaleDateString() : 'Not set'}
                    </div>
                    <div>
                      <span className="text-gray-500">Country:</span> {prof.country || 'Unknown'}
                    </div>
                    <div>
                      <span className="text-gray-500">Reminder Date:</span> {prof.reminder_date ? new Date(prof.reminder_date).toLocaleDateString() : 'Not set'}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => sendManualReminder(prof.id)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Send Manual Reminder
                    </button>
                    <button 
                      onClick={() => updateStatus(prof.id, "Follow Up")}
                      className="px-3 py-1 text-xs bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                    >
                      Mark as Follow Up
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No professors currently need reminders
              </div>
            )}
          </div>
        </div>
        
        {cronResult && (
          <div className="bg-white rounded-lg border shadow">
            <div className="border-b p-4">
              <h2 className="text-lg font-medium">Last Cron Job Results</h2>
            </div>
            <div className="p-4">
              <div className="bg-gray-50 p-4 rounded-md overflow-auto">
                <pre className="text-sm">{JSON.stringify(cronResult, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
        
        {errors.length > 0 && (
          <div className="bg-white rounded-lg border border-red-200 shadow">
            <div className="border-b border-red-200 p-4 bg-red-50 flex justify-between items-center">
              <h2 className="text-lg font-medium text-red-700">Errors</h2>
              <button 
                onClick={clearErrors}
                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="divide-y divide-red-100">
              {errors.map((error, index) => (
                <div key={index} className="p-4 bg-red-50">
                  <p className="text-red-600 font-medium mb-1">Error:</p>
                  <p className="text-sm text-red-800">{error.message}</p>
                  <p className="text-xs text-red-500 mt-1">{new Date(error.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDebugger;