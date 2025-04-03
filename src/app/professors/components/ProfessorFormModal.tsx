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
  university: string;
  country: string;
  department?: string;
  research?: string;
  scholarship?: string;
  notes?: string;
  status?: string;
  emailDate?: string;
  replyDate?: string;
  reminderDate?: string;
  emailScreenshot: File | null;
  proposalPdf: File | null;
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
  
  // Preview states
  const [emailScreenshotPreview, setEmailScreenshotPreview] = useState<string | null>(null);
  const [proposalPdfPreview, setProposalPdfPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProfessorFormData>({
    name: '',
    email: '',
    university: '',
    country: '',
    department: '',
    research: '',
    scholarship: '',
    notes: '',
    status: 'Pending',
    emailDate: new Date().toISOString().split('T')[0],
    replyDate: '',
    reminderDate: '',
    emailScreenshot: null,
    proposalPdf: null,
  });

  useEffect(() => {
    if (professor) {
      setFormData({
        name: professor.name,
        email: professor.email,
        university: professor.university_name || '',
        country: professor.country || '',
        department: professor.department || '',
        research: professor.research || '',
        scholarship: professor.scholarship || '',
        notes: professor.notes || '',
        status: professor.status || 'Pending',
        emailDate: professor.email_date || new Date().toISOString().split('T')[0],
        replyDate: professor.reply_date || '',
        reminderDate: professor.reminder_date || '',
        emailScreenshot: null,
        proposalPdf: null,
      });
      
      // Set preview URLs if files exist
      if (professor.email_screenshot?.url) {
        setEmailScreenshotPreview(professor.email_screenshot.url);
      }
      
      if (professor.proposal?.url) {
        setProposalPdfPreview(professor.proposal.url);
      }
    } else {
      // Reset form for new professor
      setFormData({
        name: '',
        email: '',
        university: '',
        country: '',
        department: '',
        research: '',
        scholarship: '',
        notes: '',
        status: 'Pending',
        emailDate: new Date().toISOString().split('T')[0],
        replyDate: '',
        reminderDate: '',
        emailScreenshot: null,
        proposalPdf: null,
      });
      
      // Clear previews
      setEmailScreenshotPreview(null);
      setProposalPdfPreview(null);
    }
  }, [professor, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'emailScreenshot' | 'proposalPdf') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      setFormData({
        ...formData,
        [field]: file
      });
      
      // Create and set preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'emailScreenshot') {
          setEmailScreenshotPreview(reader.result as string);
        } else {
          setProposalPdfPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const viewPreview = (previewUrl: string | null) => {
    if (previewUrl) {
      // If it's a data URL (local preview), we can't open it in a new tab
      if (previewUrl.startsWith('data:')) {
        // Create a temporary anchor element
        const a = document.createElement('a');
        a.href = previewUrl;
        a.target = '_blank';
        a.download = 'preview';
        a.click();
      } else {
        // Regular URL, open in new tab
        window.open(previewUrl, '_blank');
      }
    }
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
            <label htmlFor="university" className="block text-sm font-medium text-neutral-700 mb-1">
              University
            </label>
            <input
              type="text"
              id="university"
              value={formData.university}
              onChange={(e) => setFormData({...formData, university: e.target.value})}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="MIT"
              required
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-neutral-700 mb-1">
              Department
            </label>
            <input
              type="text"
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Computer Science"
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
                <option key={country.id} value={country.name}>
                  {country.flag ? `${country.flag} ` : ''}{country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Scholarship Selection */}
          <div>
            <label htmlFor="scholarship" className="block text-sm font-medium text-neutral-700 mb-1">
              Scholarship
            </label>
            <select
              id="scholarship"
              value={formData.scholarship}
              onChange={(e) => setFormData({...formData, scholarship: e.target.value})}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="">Select a scholarship</option>
              {scholarships.map(scholarship => (
                <option key={scholarship.id} value={scholarship.name}>
                  {scholarship.name}{scholarship.deadline ? ` (Deadline: ${new Date(scholarship.deadline).toLocaleDateString()})` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500 mt-1">
              Scholarship the professor is associated with
            </p>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              required
            >
              <option value="Pending">Pending</option>
              <option value="Replied">Replied</option>
              <option value="Rejected">Rejected</option>
              <option value="Follow Up">Follow Up</option>
              <option value="Scheduled">Scheduled</option>
              <option value="No Response">No Response</option>
            </select>
          </div>

          <div>
            <label htmlFor="emailDate" className="block text-sm font-medium text-neutral-700 mb-1">
              Email Date
            </label>
            <input
              type="date"
              id="emailDate"
              value={formData.emailDate}
              onChange={(e) => setFormData({...formData, emailDate: e.target.value})}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          {formData.status === 'Replied' && (
            <div>
              <label htmlFor="replyDate" className="block text-sm font-medium text-neutral-700 mb-1">
                Reply Date
              </label>
              <input
                type="date"
                id="replyDate"
                value={formData.replyDate}
                onChange={(e) => setFormData({...formData, replyDate: e.target.value})}
                className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label htmlFor="reminderDate" className="block text-sm font-medium text-neutral-700 mb-1">
              Reminder Date
            </label>
            <input
              type="date"
              id="reminderDate"
              value={formData.reminderDate}
              onChange={(e) => setFormData({...formData, reminderDate: e.target.value})}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Add any notes about this professor..."
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
              <div className="flex items-center space-x-3 mb-2">
                <button
                  type="button"
                  onClick={() => emailScreenshotRef.current?.click()}
                  className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Upload size={16} />
                  Choose File
                </button>
                <span className="text-sm text-neutral-500 truncate flex-1">
                  {formData.emailScreenshot 
                    ? formData.emailScreenshot.name 
                    : emailScreenshotPreview
                      ? "Current file: " + (professor?.email_screenshot?.url || "").split('/').pop()
                      : 'No file chosen'}
                </span>
              </div>
              {emailScreenshotPreview && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => viewPreview(emailScreenshotPreview)}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm"
                  >
                    View Current Screenshot
                  </button>
                </div>
              )}
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
              <div className="flex items-center space-x-3 mb-2">
                <button
                  type="button"
                  onClick={() => proposalPdfRef.current?.click()}
                  className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Upload size={16} />
                  Choose File
                </button>
                <span className="text-sm text-neutral-500 truncate flex-1">
                  {formData.proposalPdf 
                    ? formData.proposalPdf.name 
                    : proposalPdfPreview
                      ? "Current file: " + (professor?.proposal?.url || "").split('/').pop()
                      : 'No file chosen'}
                </span>
              </div>
              {proposalPdfPreview && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => viewPreview(proposalPdfPreview)}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm"
                  >
                    View Current Proposal
                  </button>
                </div>
              )}
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