// src/components/EmailList.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ActionButtonsGroup from './ActionButtonsGroup';

interface Email {
  id: string;
  professor: string;
  university: string;
  country: string;
  scholarship: string;
  status: string;
  emailScreenshot: string;
  proposalPdf: string;
}

interface EmailListProps {
  emails: Email[];
  onEdit?: (email: Email) => void;
  onDelete?: (emailId: string) => void;
}

const EmailList: React.FC<EmailListProps> = ({ 
  emails,
  onEdit,
  onDelete
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Replied': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const handleViewDocument = (documentUrl: string, type: 'screenshot' | 'proposal') => {
    window.open(documentUrl, '_blank');
  };

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
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(email.status)}`}>
                    {email.status}
                  </span>
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center">
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
                          <ActionButton
                            icon={Eye}
                            label="View Email Screenshot"
                            onClick={() => handleViewDocument(email.emailScreenshot, 'screenshot')}
                            variant="neutral"
                            showLabel={true}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-800 mb-2">Proposal Document</h4>
                          <ActionButton
                            icon={Eye}
                            label="View Proposal"
                            onClick={() => handleViewDocument(email.proposalPdf, 'proposal')}
                            variant="neutral"
                            showLabel={true}
                          />
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

export default EmailList;