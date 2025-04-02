// src/app/professors/components/ProfessorListView.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Professor } from '@/types';
import { ChevronDown, ChevronUp, Edit2, Trash2, Mail, FileText, Eye } from 'lucide-react';

interface ProfessorListViewProps {
  professors: Professor[];
  onEdit: (professor: Professor) => void;
  onDelete: (professorId: string) => void;
}

const ProfessorListView: React.FC<ProfessorListViewProps> = ({ professors, onEdit, onDelete }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleExpandRow = (id: string) => {
    setExpandedRow(prevId => prevId === id ? null : id);
  };

  const viewDocument = (url: string | undefined | null) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* List Header */}
      <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 grid grid-cols-12 gap-4 text-sm font-medium text-neutral-500">
        <div className="col-span-3">PROFESSOR</div>
        <div className="col-span-3">EMAIL</div>
        <div className="col-span-2">COUNTRY</div>
        <div className="col-span-2">SCHOLARSHIP</div>
        <div className="col-span-1">DATE</div>
        <div className="col-span-1">ACTIONS</div>
      </div>

      {/* List Items */}
      {professors.length === 0 ? (
        <div className="px-6 py-10 text-center text-neutral-500">
          No professors found. Click "Add Professor" to get started.
        </div>
      ) : (
        professors.map((professor) => (
          <React.Fragment key={professor.id}>
            <div 
              className={`px-6 py-4 border-b border-neutral-200 grid grid-cols-12 gap-4 items-center hover:bg-neutral-50 transition-colors cursor-pointer ${
                expandedRow === professor.id ? 'bg-neutral-50' : ''
              }`}
              onClick={() => toggleExpandRow(professor.id!)}
            >
              <div className="col-span-3 font-medium text-neutral-800 flex items-center gap-2">
                {expandedRow === professor.id ? (
                  <ChevronUp size={18} className="text-neutral-400" />
                ) : (
                  <ChevronDown size={18} className="text-neutral-400" />
                )}
                {professor.name}
              </div>
              <div className="col-span-3 text-neutral-600 truncate">
                {professor.email}
              </div>
              <div className="col-span-2 text-neutral-600">
                {professor.country}
              </div>
              <div className="col-span-2 text-neutral-600">
                {professor.scholarship || '-'}
              </div>
              <div className="col-span-1 text-neutral-600">
                {professor.createdAt ? new Date(professor.createdAt).toLocaleDateString() : '-'}
              </div>
              <div className="col-span-1 flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(professor);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors p-1"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(professor.id!);
                  }}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Expanded Row with Documents */}
            <AnimatePresence>
              {expandedRow === professor.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-neutral-50 border-b border-neutral-200 overflow-hidden"
                >
                  <div className="p-6 grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-medium text-neutral-800 flex items-center gap-2">
                        <Mail size={16} className="text-indigo-500" />
                        Email Screenshot
                      </h4>
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => viewDocument(professor.emailScreenshot)}
                          disabled={!professor.emailScreenshot}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                            professor.emailScreenshot 
                              ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                          } transition-colors`}
                        >
                          <Eye size={16} />
                          View Screenshot
                        </button>
                        <span className="text-sm text-neutral-500">
                          {professor.emailScreenshot 
                            ? professor.emailScreenshot.split('/').pop() 
                            : 'No screenshot available'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-neutral-800 flex items-center gap-2">
                        <FileText size={16} className="text-indigo-500" />
                        Proposal PDF
                      </h4>
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => viewDocument(professor.proposalPdf)}
                          disabled={!professor.proposalPdf}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                            professor.proposalPdf 
                              ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                          } transition-colors`}
                        >
                          <Eye size={16} />
                          View Proposal
                        </button>
                        <span className="text-sm text-neutral-500">
                          {professor.proposalPdf 
                            ? professor.proposalPdf.split('/').pop() 
                            : 'No proposal available'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </React.Fragment>
        ))
      )}
    </div>
  );
};

export default ProfessorListView;