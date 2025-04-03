// src/components/QuickEditModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Check, AlertTriangle } from 'lucide-react';
import { Email } from './EmailList'; // Import the Email interface

interface QuickEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: Email | null;
  onSave: (emailId: string, updates: { status: string, notes?: string }) => Promise<boolean>;
}

const QuickEditModal: React.FC<QuickEditModalProps> = ({
  isOpen,
  onClose,
  email,
  onSave
}) => {
  const [status, setStatus] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (email) {
      setStatus(email.status || 'Pending');
      setNotes('');
    }
  }, [email]);

  const statusOptions = [
    { value: 'Pending', label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Replied', label: 'Replied', icon: Check, color: 'bg-green-100 text-green-800' },
    { value: 'Rejected', label: 'Rejected', icon: AlertTriangle, color: 'bg-red-100 text-red-800' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setIsSaving(true);
    try {
      const updates = {
        status,
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