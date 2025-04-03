// src/components/EmailList.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Eye, Edit2 } from 'lucide-react';
import ActionButtonsGroup from './ActionButtonsGroup';
import ActionButton from './ActionButton';
import EmailStatusDropdown from './EmailStatusDropdown';

export interface Email {
  id: string;
  professor: string;
  university: string;
  country: string;
  scholarship: string;
  status: string;
  emailScreenshot: string | null;
  proposalPdf: string | null;
}

interface EmailListProps {
  emails: Email[];
  onEdit?: (email: Email) => void;
  onDelete?: (emailId: string) => void;
  onViewEmail?: (emailScreenshot: string) => void;
  onViewProposal?: (proposalPdf: string) => void;
  onStatusChange?: (emailId: string, newStatus: string) => void;
  onQuickEdit?: (email: Email) => void;
}

const EmailList: React.FC<EmailListProps> = ({ 
  emails,
  onEdit,
  onDelete,
  onViewEmail,
  onViewProposal,
  onStatusChange,
  onQuickEdit
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleExpandRow = (id: string) => {
    setExpandedRow(prevId => prevId === id ? null : id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-lg"
    >
      <div className="px-6 py-4 border-b border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-800">Email Tracking</h2>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-neutral-50 text-neutral-600">
            {['Professor', 'University', 'Country', 'Scholarship', 'Status', 'Actions'].map((header) => (
              <th key={header} className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                header === 'Actions' ? 'text-center' : ''
              }`}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {emails.map((email) => (
            <React.Fragment key={email.id}>
              <tr 
                className={`border-b border-neutral-200 hover:bg-neutral-50 transition-colors duration-300 cursor-pointer ${
                  expandedRow === email.id ? 'bg-neutral-50' : ''
                }`}
                onClick={() => toggleExpandRow(email.id)}
              >
                <td className="px-6 py-4 font-medium text-neutral-800 flex items-center gap-2">
                  {expandedRow === email.id ? (
                    <ChevronUp size={18} className="text-neutral-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-neutral-400 flex-shrink-0" />
                  )}
                  {email.professor}
                </td>
                <td className="px-6 py-4 text-neutral-600">{email.university}</td>
                <td className="px-6 py-4 text-neutral-600">{email.country}</td>
                <td className="px-6 py-4 text-neutral-600">{email.scholarship}</td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  {onStatusChange ? (
                    <EmailStatusDropdown 
                      status={email.status} 
                      emailId={email.id} 
                      onStatusChange={onStatusChange} 
                    />
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(email.status)}`}>
                      {email.status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center space-x-2">
                    {/* Quick Edit button */}
                    {onQuickEdit && (
                      <ActionButton
                        icon={Edit2}
                        label="Quick Edit"
                        onClick={() => onQuickEdit(email)}
                        variant="neutral"
                        size="sm"
                      />
                    )}
                    <ActionButtonsGroup
                      onEdit={onEdit ? () => onEdit(email) : undefined}
                      onDelete={onDelete ? () => onDelete(email.id) : undefined}
                      size="sm"
                    />
                  </div>
                </td>
              </tr>

              {/* Expanded Row */}
              <AnimatePresence>
                {expandedRow === email.id && (
                  <motion.tr
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-neutral-50"
                  >
                    <td colSpan={6} className="px-6 py-4 border-b border-neutral-200">
                      <div className="flex gap-8">
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-800 mb-2">Email Screenshot</h4>
                          {email.emailScreenshot ? (
                            <ActionButton
                              icon={Eye}
                              label="View Email Screenshot"
                              onClick={() => onViewEmail && onViewEmail(email.emailScreenshot!)}
                              variant="neutral"
                              showLabel={true}
                            />
                          ) : (
                            <p className="text-neutral-500 text-sm">No email screenshot available</p>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-800 mb-2">Proposal Document</h4>
                          {email.proposalPdf ? (
                            <ActionButton
                              icon={Eye}
                              label="View Proposal"
                              onClick={() => onViewProposal && onViewProposal(email.proposalPdf!)}
                              variant="neutral"
                              showLabel={true}
                            />
                          ) : (
                            <p className="text-neutral-500 text-sm">No proposal document available</p>
                          )}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

// Helper function
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Replied': return 'bg-green-100 text-green-800';
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    case 'Rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-neutral-100 text-neutral-800';
  }
};

export default EmailList;