//src/app/professors/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Professor, Country, Scholarship } from '@/types';
import { Plus, Search } from 'lucide-react';
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

export default function ProfessorsPage(): React.ReactNode {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentProfessor, setCurrentProfessor] = useState<Professor | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  const filters = [
    { id: 'all', label: 'All Professors' },
    { id: 'pending', label: 'Pending' },
    { id: 'replied', label: 'Replied' },
    { id: 'rejected', label: 'Rejected' }
  ];
  
  useEffect(() => {
    // Fetch data from Supabase when component mounts
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      
      try {
        const [professorsData, countriesData, scholarshipsData] = await Promise.all([
          getProfessors(),
          getCountries(),
          getScholarships()
        ]);
        
        setProfessors(professorsData);
        setFilteredProfessors(professorsData);
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

  // Filter professors based on search term and active filter
  useEffect(() => {
    const filtered = professors.filter(professor => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        professor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (professor.email && professor.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (professor.university_name && professor.university_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (professor.country && professor.country.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter
      let matchesStatus = activeFilter === 'all';
      
      if (activeFilter === 'pending' && professor.status === 'Pending') matchesStatus = true;
      if (activeFilter === 'replied' && professor.status === 'Replied') matchesStatus = true;
      if (activeFilter === 'rejected' && professor.status === 'Rejected') matchesStatus = true;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredProfessors(filtered);
  }, [professors, searchTerm, activeFilter]);

  const handleAddNewProfessor = (): void => {
    setCurrentProfessor(null);
    setIsFormOpen(true);
  };

  const handleEditProfessor = (professor: Professor): void => {
    setCurrentProfessor(professor);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (professorId: string): void => {
    setConfirmDeleteId(professorId);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
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

  const handleFormSubmit = async (formData: ProfessorFormData): Promise<void> => {
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
    <div className="w-full bg-neutral-50">
      {/* Hero Section with Search Bar - Full Width */}
      <div className="w-full bg-neutral-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-grow max-w-2xl">
              <input
                type="text"
                placeholder="Search professors by name, email, university..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl pl-14 pr-5 py-4 text-neutral-700 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all duration-300 shadow-sm"
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400">
                <Search size={20} />
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNewProfessor}
              className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 shadow-md"
            >
              <Plus size={16} />
              Add Professor
            </motion.button>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex overflow-x-auto whitespace-nowrap gap-2 pb-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeFilter === filter.id
                    ? 'bg-neutral-800 text-white shadow-md'
                    : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && professors.length === 0 && (
          <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-12 text-center">
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
            professors={filteredProfessors} 
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
    </div>
  );
}