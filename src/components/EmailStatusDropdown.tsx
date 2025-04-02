// src/components/EmailStatusDropdown.tsx
'use client';

import React, { useState } from 'react';
import { Check, ChevronDown, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmailStatusDropdownProps {
  status: string;
  emailId: string;
  onStatusChange: (emailId: string, newStatus: string) => void;
}

const EmailStatusDropdown: React.FC<EmailStatusDropdownProps> = ({
  status,
  emailId,
  onStatusChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Enhanced status options for future Twilio integration
  const statusOptions = [
    { value: 'Pending', label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Replied', label: 'Replied', icon: Check, color: 'bg-green-100 text-green-800' },
    { value: 'Rejected', label: 'Rejected', icon: AlertTriangle, color: 'bg-red-100 text-red-800' },
    { value: 'Follow Up', label: 'Follow Up', icon: Clock, color: 'bg-blue-100 text-blue-800' },
    { value: 'Scheduled', label: 'Scheduled', icon: Clock, color: 'bg-purple-100 text-purple-800' },
    { value: 'No Response', label: 'No Response', icon: AlertTriangle, color: 'bg-orange-100 text-orange-800' }
  ];

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onStatusChange(emailId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  const getStatusColor = (statusValue: string) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option ? option.color : 'bg-neutral-100 text-neutral-800';
  };

  const getStatusIcon = (statusValue: string) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option ? option.icon : Clock;
  };

  const CurrentIcon = getStatusIcon(status);

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(status)} ${isUpdating ? 'opacity-50' : 'cursor-pointer hover:opacity-80'}`}
        onClick={() => !isUpdating && setIsOpen(!isOpen)}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <div className="h-3 w-3 rounded-full border-t-2 border-r-2 animate-spin mr-1" />
        ) : (
          <CurrentIcon size={12} />
        )}
        {status}
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-1 z-50 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 min-w-[150px]"
          >
            {statusOptions.map((option) => {
              const OptionIcon = option.icon;
              return (
                <button
                  key={option.value}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-neutral-50 ${option.value === status ? 'bg-neutral-50 font-medium' : ''}`}
                  onClick={() => handleStatusChange(option.value)}
                >
                  <OptionIcon size={14} className="flex-shrink-0" />
                  {option.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailStatusDropdown;