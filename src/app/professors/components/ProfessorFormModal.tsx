// src/app/professors/components/ProfessorFormModal.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { Professor, Country, Scholarship } from '@/types';

interface ProfessorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (professor: ProfessorFormData) => void;
  professor?: Professor | null;
  countries: Country[];
  scholarships: Scholarship[];
}

export interface ProfessorFormData {
  name: string;
  email: string;
  country: string;
  scholarship: string;
  createdAt: string;
  emailScreenshot: File | null;
  proposalPdf: File | null;
  currentEmailScreenshot?: string | null;
  currentProposalPdf?: string | null;
}

const ProfessorFormModal: React.FC<ProfessorFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  professor = null,
  countries,
  scholarships,
}) => {
  // File refs
  const emailScreenshotRef = useRef<HTMLInputElement>(null);
  const proposalPdfRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ProfessorFormData>({
    name: '',
    email: '',
    country: '',
    scholarship: '',
    createdAt: new Date().toISOString().split('T')[0],
    emailScreenshot: null,
    proposalPdf: null,
    currentEmailScreenshot: null,
    currentProposalPdf: null,
  });

  useEffect(() => {
    if (professor) {
      setFormData({
        name: professor.name,
        email: professor.email,
        country: professor.country,
        scholarship: professor.scholarship || '',
        createdAt: professor.createdAt || new Date().toISOString().split('T')[0],
        emailScreenshot: null,
        proposalPdf: null,
        currentEmailScreenshot: professor.emailScreenshot,
        currentProposalPdf: professor.proposalPdf,
      });
    } else {
      // Reset form for new professor
      setFormData({
        name: '',
        email: '',
        country: '',
        scholarship: '',
        createdAt: new Date().toISOString().split('T')[0],
        emailScreenshot: null,
        proposalPdf: null,
        currentEmailScreenshot: null,
        currentProposalPdf: null,
      });
    }
  }, [professor, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'emailScreenshot' | 'proposalPdf') => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        [field]: e.target.files[0]
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

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
        className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b border-neutral-200 p-5 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-neutral-800">
            {professor ? 'Edit Professor' : 'Add New Professor'}
          </h2>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Dr. John Smith"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="john.smith@university.edu"
              required
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-neutral-700 mb-1">
              Country
            </label>
            <select
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              required
            >
              <option value="">Select a country</option>
              {countries.map(country => (
                <option key={country.id} value={country.name}>{country.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="scholarship" className="block text-sm font-medium text-neutral-700 mb-1">
              Scholarship (optional)
            </label>
            <select
              id="scholarship"
              value={formData.scholarship}
              onChange={(e) => setFormData({...formData, scholarship: e.target.value})}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="">Select a scholarship</option>
              {scholarships.map(scholarship => (
                <option key={scholarship.id} value={scholarship.name}>{scholarship.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="createdAt" className="block text-sm font-medium text-neutral-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="createdAt"
              value={formData.createdAt}
              onChange={(e) => setFormData({...formData, createdAt: e.target.value})}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          {/* File Upload Section */}
          <div className="border border-neutral-200 rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-neutral-800">Documents</h3>

            {/* Email Screenshot */}
            <div>
              <label htmlFor="emailScreenshot" className="block text-sm font-medium text-neutral-700 mb-1">
                Email Screenshot
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => emailScreenshotRef.current?.click()}
                  className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Upload size={16} />
                  Choose File
                </button>
                <span className="text-sm text-neutral-500 truncate">
                  {formData.emailScreenshot 
                    ? formData.emailScreenshot.name 
                    : formData.currentEmailScreenshot?.split('/').pop() || 'No file chosen'}
                </span>
              </div>
              <input
                ref={emailScreenshotRef}
                type="file"
                id="emailScreenshot"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'emailScreenshot')}
                className="sr-only"
              />
            </div>

            {/* Proposal PDF */}
            <div>
              <label htmlFor="proposalPdf" className="block text-sm font-medium text-neutral-700 mb-1">
                Proposal PDF
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => proposalPdfRef.current?.click()}
                  className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Upload size={16} />
                  Choose File
                </button>
                <span className="text-sm text-neutral-500 truncate">
                  {formData.proposalPdf 
                    ? formData.proposalPdf.name 
                    : formData.currentProposalPdf?.split('/').pop() || 'No file chosen'}
                </span>
              </div>
              <input
                ref={proposalPdfRef}
                type="file"
                id="proposalPdf"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, 'proposalPdf')}
                className="sr-only"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors duration-300"
            >
              {professor ? 'Update Professor' : 'Add Professor'}
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

export default ProfessorFormModal;