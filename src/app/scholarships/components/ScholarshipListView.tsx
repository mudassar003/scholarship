// src/app/scholarships/components/ScholarshipListView.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scholarship } from '@/types';
import { ChevronDown, ChevronUp, Edit2, Trash2, ExternalLink, Calendar, MapPin, AlignLeft } from 'lucide-react';

interface ScholarshipListViewProps {
  scholarships: Scholarship[];
  onEdit: (scholarship: Scholarship) => void;
  onDelete: (scholarshipId: string) => void;
}

const ScholarshipListView: React.FC<ScholarshipListViewProps> = ({ scholarships, onEdit, onDelete }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleExpandRow = (id: string) => {
    setExpandedRow(prevId => prevId === id ? null : id);
  };

  const getDeadlineStatus = (deadline: string | undefined) => {
    if (!deadline) return { label: 'No Deadline', className: 'bg-neutral-100 text-neutral-800' };
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate days difference
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: 'Expired', className: 'bg-red-100 text-red-800' };
    } else if (diffDays === 0) {
      return { label: 'Today', className: 'bg-orange-100 text-orange-800' };
    } else if (diffDays <= 7) {
      return { label: `${diffDays} ${diffDays === 1 ? 'day' : 'days'} left`, className: 'bg-yellow-100 text-yellow-800' };
    } else if (diffDays <= 30) {
      return { label: `${Math.floor(diffDays / 7)} ${Math.floor(diffDays / 7) === 1 ? 'week' : 'weeks'} left`, className: 'bg-lime-100 text-lime-800' };
    } else {
      return { label: `${Math.floor(diffDays / 30)} ${Math.floor(diffDays / 30) === 1 ? 'month' : 'months'} left`, className: 'bg-green-100 text-green-800' };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* List Header */}
      <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 grid grid-cols-12 gap-4 text-sm font-medium text-neutral-500">
        <div className="col-span-4">SCHOLARSHIP</div>
        <div className="col-span-3">COUNTRY</div>
        <div className="col-span-3">DEADLINE</div>
        <div className="col-span-2">ACTIONS</div>
      </div>

      {/* List Items */}
      {scholarships.length === 0 ? (
        <div className="px-6 py-10 text-center text-neutral-500">
          No scholarships found. Add your first scholarship to get started.
        </div>
      ) : (
        scholarships.map((scholarship) => (
          <React.Fragment key={scholarship.id}>
            <div 
              className={`px-6 py-4 border-b border-neutral-200 grid grid-cols-12 gap-4 items-center hover:bg-neutral-50 transition-colors cursor-pointer ${
                expandedRow === scholarship.id ? 'bg-neutral-50' : ''
              }`}
              onClick={() => toggleExpandRow(scholarship.id)}
            >
              <div className="col-span-4 font-medium text-neutral-800 flex items-center gap-2">
                {expandedRow === scholarship.id ? (
                  <ChevronUp size={18} className="text-neutral-400" />
                ) : (
                  <ChevronDown size={18} className="text-neutral-400" />
                )}
                {scholarship.name}
              </div>
              <div className="col-span-3 text-neutral-600">
                {scholarship.country || '-'}
              </div>
              <div className="col-span-3">
                {scholarship.deadline ? (
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${getDeadlineStatus(scholarship.deadline).className}`}>
                      {getDeadlineStatus(scholarship.deadline).label}
                    </span>
                    <span className="text-neutral-500 text-sm">
                      {new Date(scholarship.deadline).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-neutral-500">No deadline</span>
                )}
              </div>
              <div className="col-span-2 flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(scholarship);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors p-1"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(scholarship.id);
                  }}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Expanded Row with Details */}
            <AnimatePresence>
              {expandedRow === scholarship.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-neutral-50 border-b border-neutral-200 overflow-hidden"
                >
                  <div className="p-6 grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <h4 className="font-medium text-neutral-800 flex items-center gap-2">
                          <MapPin size={16} className="text-indigo-500" />
                          Country
                        </h4>
                        <p className="text-neutral-700">{scholarship.country || 'Not specified'}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-neutral-800 flex items-center gap-2">
                          <Calendar size={16} className="text-indigo-500" />
                          Deadline
                        </h4>
                        <p className="text-neutral-700">
                          {scholarship.deadline 
                            ? new Date(scholarship.deadline).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })
                            : 'No deadline specified'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-neutral-800 flex items-center gap-2">
                          <ExternalLink size={16} className="text-indigo-500" />
                          Website
                        </h4>
                        {scholarship.website ? (
                          <a 
                            href={scholarship.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 hover:underline truncate block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {scholarship.website}
                          </a>
                        ) : (
                          <p className="text-neutral-700">No website provided</p>
                        )}
                      </div>
                    </div>

                    {scholarship.description && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-neutral-800 flex items-center gap-2">
                          <AlignLeft size={16} className="text-indigo-500" />
                          Description
                        </h4>
                        <p className="text-neutral-700 bg-white p-3 rounded-lg border border-neutral-200 whitespace-pre-line">
                          {scholarship.description}
                        </p>
                      </div>
                    )}
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

export default ScholarshipListView;