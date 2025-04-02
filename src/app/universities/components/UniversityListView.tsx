// src/app/universities/components/UniversityListView.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { University } from '@/types';
import { ChevronDown, ChevronUp, Edit2, Trash2, ExternalLink, MapPin, Building } from 'lucide-react';

interface UniversityListViewProps {
  universities: University[];
  onEdit: (university: University) => void;
  onDelete: (universityId: string) => void;
}

const UniversityListView: React.FC<UniversityListViewProps> = ({ universities, onEdit, onDelete }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleExpandRow = (id: string) => {
    setExpandedRow(prevId => prevId === id ? null : id);
  };

  const openWebsite = (website: string | undefined) => {
    if (website) {
      // Ensure the URL has http:// or https:// prefix
      const url = website.startsWith('http') ? website : `https://${website}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* List Header */}
      <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 grid grid-cols-12 gap-4 text-sm font-medium text-neutral-500">
        <div className="col-span-4">UNIVERSITY</div>
        <div className="col-span-3">COUNTRY</div>
        <div className="col-span-3">CITY</div>
        <div className="col-span-2">ACTIONS</div>
      </div>

      {/* List Items */}
      {universities.length === 0 ? (
        <div className="px-6 py-10 text-center text-neutral-500">
          No universities found. Add your first university to get started.
        </div>
      ) : (
        universities.map((university) => (
          <React.Fragment key={university.id}>
            <div 
              className={`px-6 py-4 border-b border-neutral-200 grid grid-cols-12 gap-4 items-center hover:bg-neutral-50 transition-colors cursor-pointer ${
                expandedRow === university.id ? 'bg-neutral-50' : ''
              }`}
              onClick={() => toggleExpandRow(university.id)}
            >
              <div className="col-span-4 font-medium text-neutral-800 flex items-center gap-2">
                {expandedRow === university.id ? (
                  <ChevronUp size={18} className="text-neutral-400" />
                ) : (
                  <ChevronDown size={18} className="text-neutral-400" />
                )}
                {university.name}
              </div>
              <div className="col-span-3 text-neutral-600">
                {university.country || '-'}
              </div>
              <div className="col-span-3 text-neutral-600">
                {university.city || '-'}
              </div>
              <div className="col-span-2 flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(university);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors p-1"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(university.id);
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
              {expandedRow === university.id && (
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
                          <Building size={16} className="text-indigo-500" />
                          University
                        </h4>
                        <p className="text-neutral-700 font-medium">{university.name}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-neutral-800 flex items-center gap-2">
                          <MapPin size={16} className="text-indigo-500" />
                          Location
                        </h4>
                        <p className="text-neutral-700">
                          {university.city ? `${university.city}, ` : ''}{university.country || 'Not specified'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-neutral-800 flex items-center gap-2">
                          <ExternalLink size={16} className="text-indigo-500" />
                          Website
                        </h4>
                        {university.website ? (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openWebsite(university.website);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 hover:underline truncate block text-left"
                          >
                            {university.website}
                          </button>
                        ) : (
                          <p className="text-neutral-700">No website provided</p>
                        )}
                      </div>
                    </div>

                    {/* Scholarships associated with this university (if any) */}
                    {university.scholarships && university.scholarships.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-neutral-800">Associated Scholarships</h4>
                        <div className="flex flex-wrap gap-2">
                          {university.scholarships.map((scholarship, index) => (
                            <span 
                              key={index} 
                              className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                            >
                              {scholarship}
                            </span>
                          ))}
                        </div>
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

export default UniversityListView;