'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Professor, Country, Scholarship } from '@/types';
import { Plus } from 'lucide-react';
import ProfessorListView from './components/ProfessorListView';
import ProfessorFormModal, { ProfessorFormData } from './components/ProfessorFormModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

// Dummy data for countries and scholarships
const DUMMY_COUNTRIES: Country[] = [
  { id: '1', name: 'United States', code: 'US' },
  { id: '2', name: 'United Kingdom', code: 'UK' },
  { id: '3', name: 'Canada', code: 'CA' },
  { id: '4', name: 'Australia', code: 'AU' }
];

const DUMMY_SCHOLARSHIPS: Scholarship[] = [
  { id: '1', name: 'Research Grant 2024', country: 'United States' },
  { id: '2', name: 'Postdoctoral Fellowship', country: 'United Kingdom' },
  { id: '3', name: 'Graduate Research Scholarship', country: 'Canada' }
];

// Dummy initial professors
const DUMMY_PROFESSORS: Professor[] = [
  {
    id: '1',
    name: 'Dr. John Smith',
    email: 'john.smith@university.edu',
    country: 'United States',
    scholarship: 'Research Grant 2024',
    emailScreenshot: '/dummy-screenshot.png',
    proposalPdf: '/dummy-proposal.pdf',
    createdAt: '2023-11-15'
  },
  {
    id: '2',
    name: 'Dr. Emma Watson',
    email: 'emma.watson@oxford.ac.uk',
    country: 'United Kingdom',
    scholarship: 'Postdoctoral Fellowship',
    emailScreenshot: '/dummy-screenshot-2.png',
    proposalPdf: '/dummy-proposal-2.pdf',
    createdAt: '2023-12-10'
  },
  {
    id: '3',
    name: 'Dr. Michael Chen',
    email: 'mchen@utoronto.ca',
    country: 'Canada',
    scholarship: 'Graduate Research Scholarship',
    emailScreenshot: '/dummy-screenshot-3.png',
    proposalPdf: '/dummy-proposal-3.pdf',
    createdAt: '2024-01-05'
  },
  {
    id: '4',
    name: 'Dr. Sarah Johnson',
    email: 'sjohnson@sydney.edu.au',
    country: 'Australia',
    scholarship: null,
    emailScreenshot: '/dummy-screenshot-4.png',
    proposalPdf: '/dummy-proposal-4.pdf',
    createdAt: '2024-02-20'
  }
];

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>(DUMMY_PROFESSORS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentProfessor, setCurrentProfessor] = useState<Professor | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const handleAddNewProfessor = () => {
    setCurrentProfessor(null);
    setIsFormOpen(true);
  };

  const handleEditProfessor = (professor: Professor) => {
    setCurrentProfessor(professor);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (professorId: string) => {
    setConfirmDeleteId(professorId);
  };

  const handleDeleteConfirm = () => {
    if (confirmDeleteId) {
      setProfessors(professors.filter(prof => prof.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  const handleFormSubmit = (formData: ProfessorFormData) => {
    // Prepare file paths (in a real app this would upload the files)
    const emailScreenshotPath = formData.emailScreenshot 
      ? `/uploads/${formData.emailScreenshot.name}` 
      : formData.currentEmailScreenshot;

    const proposalPdfPath = formData.proposalPdf
      ? `/uploads/${formData.proposalPdf.name}`
      : formData.currentProposalPdf;
    
    if (currentProfessor) {
      // Update existing professor
      setProfessors(professors.map(prof => 
        prof.id === currentProfessor.id ? 
        {
          ...prof,
          name: formData.name,
          email: formData.email,
          country: formData.country,
          scholarship: formData.scholarship || null,
          emailScreenshot: emailScreenshotPath,
          proposalPdf: proposalPdfPath,
          createdAt: formData.createdAt
        } : prof
      ));
    } else {
      // Add new professor
      const newProfessor: Professor = {
        id: String(Date.now()),
        name: formData.name,
        email: formData.email,
        country: formData.country,
        scholarship: formData.scholarship || null,
        emailScreenshot: emailScreenshotPath,
        proposalPdf: proposalPdfPath,
        createdAt: formData.createdAt
      };
      setProfessors([...professors, newProfessor]);
    }
    
    setIsFormOpen(false);
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-800">Professors</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddNewProfessor}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-300"
        >
          <Plus size={18} />
          <span>Add Professor</span>
        </motion.button>
      </div>

      {/* Professor List */}
      <ProfessorListView 
        professors={professors} 
        onEdit={handleEditProfessor}
        onDelete={handleDeleteClick}
      />

      {/* Professor Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <ProfessorFormModal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
            professor={currentProfessor}
            countries={DUMMY_COUNTRIES}
            scholarships={DUMMY_SCHOLARSHIPS}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <DeleteConfirmationModal
            isOpen={!!confirmDeleteId}
            onClose={() => setConfirmDeleteId(null)}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}