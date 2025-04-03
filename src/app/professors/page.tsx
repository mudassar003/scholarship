//src/app/professors/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Professor, Country, Scholarship } from '@/types';
import { Plus } from 'lucide-react';
import ProfessorListView from './components/ProfessorListView';
import ProfessorFormModal, { ProfessorFormData } from './components/ProfessorFormModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import { 
  getProfessors, 
  createProfessor, 
  updateProfessor, 
  deleteProfessor 
} from '@/services/professorService';
import { getCountries } from '@/services/countryService';
import { getScholarships } from '@/services/scholarshipService';

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentProfessor, setCurrentProfessor] = useState<Professor | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch data from Supabase when component mounts
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const [professorsData, countriesData, scholarshipsData] = await Promise.all([
          getProfessors(),
          getCountries(),
          getScholarships()
        ]);
        
        setProfessors(professorsData);
        setCountries(countriesData);
        setScholarships(scholarshipsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

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

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId) {
      setIsLoading(true);
      const success = await deleteProfessor(confirmDeleteId);
      
      if (success) {
        setProfessors(professors.filter(prof => prof.id !== confirmDeleteId));
      }
      
      setConfirmDeleteId(null);
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: ProfessorFormData) => {
    setIsLoading(true);
    
    try {
      if (currentProfessor?.id) {
        // Update existing professor (only pass non-empty values)
        const updateData: Partial<Professor> = {
          name: formData.name,
          email: formData.email
        };
        
        // Only add fields that have values
        if (formData.university) updateData.university_name = formData.university;
        if (formData.country) updateData.country = formData.country;
        if (formData.department) updateData.department = formData.department;
        if (formData.status) updateData.status = formData.status;
        if (formData.notes) updateData.notes = formData.notes;
        if (formData.emailDate) updateData.email_date = formData.emailDate;
        if (formData.replyDate) updateData.reply_date = formData.replyDate;
        if (formData.reminderDate) updateData.reminder_date = formData.reminderDate;
        if (formData.research) updateData.research = formData.research;
        
        // Save the scholarship to the scholarship column
        if (formData.scholarship) updateData.scholarship = formData.scholarship;
        
        const updatedProfessor = await updateProfessor(
          currentProfessor.id,
          updateData,
          formData.emailScreenshot,
          formData.proposalPdf
        );
        
        if (updatedProfessor) {
          setProfessors(professors.map(prof => 
            prof.id === currentProfessor.id ? updatedProfessor : prof
          ));
        }
      } else {
        // Create new professor (only pass non-empty values)
        const professorData: Partial<Professor> = {
          name: formData.name,
          email: formData.email
        };
        
        // Only add fields that have values
        if (formData.university) professorData.university_name = formData.university;
        if (formData.country) professorData.country = formData.country;
        if (formData.department) professorData.department = formData.department;
        if (formData.status) professorData.status = formData.status;
        if (formData.notes) professorData.notes = formData.notes;
        if (formData.emailDate) professorData.email_date = formData.emailDate;
        if (formData.replyDate) professorData.reply_date = formData.replyDate;
        if (formData.reminderDate) professorData.reminder_date = formData.reminderDate;
        if (formData.research) professorData.research = formData.research;
        
        // Save the scholarship to the scholarship column
        if (formData.scholarship) professorData.scholarship = formData.scholarship;
        
        const newProfessor = await createProfessor(
          professorData as Omit<Professor, 'id' | 'created_at' | 'updated_at'>,
          formData.emailScreenshot,
          formData.proposalPdf
        );
        
        if (newProfessor) {
          setProfessors([newProfessor, ...professors]);
        }
      }
    } catch (error) {
      console.error('Error saving professor:', error);
    } finally {
      setIsLoading(false);
      setIsFormOpen(false);
    }
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && professors.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
          <h3 className="text-xl font-medium text-neutral-800 mb-2">No Professors Yet</h3>
          <p className="text-neutral-600 mb-6">
            Start by adding your first professor to track your communications.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNewProfessor}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-300"
          >
            <Plus size={18} />
            <span>Add Professor</span>
          </motion.button>
        </div>
      )}

      {/* Professor List */}
      {!isLoading && professors.length > 0 && (
        <ProfessorListView 
          professors={professors} 
          onEdit={handleEditProfessor}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Professor Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <ProfessorFormModal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
            professor={currentProfessor}
            countries={countries}
            scholarships={scholarships}
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