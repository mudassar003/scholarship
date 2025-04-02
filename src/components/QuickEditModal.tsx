// src/components/QuickEditModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Check, AlertTriangle } from 'lucide-react';

interface Email {
  id: string;
  professor: string;
  university: string;
  country: string;
  scholarship: string;
  status: string;
}

interface QuickEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: Email | null;
  onSave: (emailId: string, updates: { status: string, reminderDate?: string, notes?: string }) => Promise<boolean>;
}

const QuickEditModal: React.FC<QuickEditModalProps> = ({
  isOpen,
  onClose,
  email,
  onSave
}) => {
  const [status, setStatus] = useState<string>('');
  const [reminderDate, setReminderDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (email) {
      setStatus(email.status || 'Pending');
      
      // Set default reminder date based on status
      if (status === 'Follow Up' || status === 'No Response') {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        setReminderDate(nextWeek.toISOString().split('T')[0]);
      } else if (status === 'Scheduled') {
        const threeDaysLater = new Date();
        threeDaysLater.setDate(threeDaysLater.getDate() + 3);
        setReminderDate(threeDaysLater.toISOString().split('T')[0]);
      } else {
        setReminderDate('');
      }
    }
  }, [email, status]);

  const statusOptions = [
    { value: 'Pending', label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Replied', label: 'Replied', icon: Check, color: 'bg-green-100 text-green-800' },
    { value: 'Rejected', label: 'Rejected', icon: AlertTriangle, color: 'bg-red-100 text-red-800' },
    { value: 'Follow Up', label: 'Follow Up', icon: Clock, color: 'bg-blue-100 text-blue-800' },
    { value: 'Scheduled', label: 'Scheduled', icon: Clock, color: 'bg-purple-100 text-purple-800' },
    { value: 'No Response', label: 'No Response', icon: AlertTriangle, color: 'bg-orange-100 text-orange-800' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setIsSaving(true);
    try {
      const updates = {
        status,
        reminderDate,
        notes
      };
      
      const success = await onSave(email.id, updates);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving quick edit:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !email) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="flex justify-between items-center border-b border-neutral-200 p-5">
          <h2 className="text-xl font-semibold text-neutral-800">
            Quick Edit: {email.professor}
          </h2>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map((option) => {
                const StatusIcon = option.icon;
                return (
                  <button
                    type="button"
                    key={option.value}
                    className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 border ${
                      status === option.value 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                    onClick={() => setStatus(option.value)}
                  >
                    <StatusIcon className={status === option.value ? 'text-indigo-500' : 'text-neutral-500'} size={18} />
                    <span className={`text-xs font-medium ${status === option.value ? 'text-indigo-700' : 'text-neutral-700'}`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reminder Date - show for relevant statuses */}
          {(status === 'Follow Up' || status === 'Scheduled' || status === 'No Response') && (
            <div>
              <label htmlFor="reminderDate" className="block text-sm font-medium text-neutral-700 mb-1">
                Reminder Date
              </label>
              <input
                type="date"
                id="reminderDate"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              <p className="text-xs text-neutral-500 mt-1">
                {status === 'Follow Up' && 'Date to follow up with the professor.'}
                {status === 'Scheduled' && 'Date of the scheduled meeting/call.'}
                {status === 'No Response' && 'Date to check again if no response is received.'}
              </p>
            </div>
          )}

          {/* Quick notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Add any notes about this status change..."
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className={`flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors duration-300 ${
                isSaving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default QuickEditModal;