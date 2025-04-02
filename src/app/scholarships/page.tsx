//src/app/scholarships/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scholarship, Country } from '@/types';
import { Plus } from 'lucide-react';
import { getScholarships, createScholarship, updateScholarship, deleteScholarship } from '@/services/scholarshipService';
import { getCountries } from '@/services/countryService';
import ScholarshipListView from './components/ScholarshipListView';
import ScholarshipFormModal from './components/ScholarshipFormModal';
import DeleteConfirmationModal from '@/app/professors/components/DeleteConfirmationModal';
import SearchAndFilter from '@/components/SearchAndFilter';

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentScholarship, setCurrentScholarship] = useState<Scholarship | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Define filters
  const filters = [
    { id: 'all', label: 'All Scholarships' },
    { id: 'upcoming', label: 'Upcoming Deadlines' },
    { id: 'past', label: 'Past Deadlines' }
  ];

  useEffect(() => {
    // Fetch data from Supabase when component mounts
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const [scholarshipsData, countriesData] = await Promise.all([
          getScholarships(),
          getCountries()
        ]);
        
        setScholarships(scholarshipsData);
        setCountries(countriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter scholarships based on search term and active filter
  const filteredScholarships = scholarships.filter(scholarship => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (scholarship.country && scholarship.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (scholarship.description && scholarship.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Deadline filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadlineDate = scholarship.deadline ? new Date(scholarship.deadline) : null;
    if (deadlineDate) deadlineDate.setHours(0, 0, 0, 0);
    
    const matchesDeadline = activeFilter === 'all' || 
      (activeFilter === 'upcoming' && deadlineDate && deadlineDate >= today) ||
      (activeFilter === 'past' && deadlineDate && deadlineDate < today);
    
    return matchesSearch && matchesDeadline;
  });

  const handleAddNewScholarship = () => {
    setCurrentScholarship(null);
    setIsFormOpen(true);
  };

  const handleEditScholarship = (scholarship: Scholarship) => {
    setCurrentScholarship(scholarship);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (scholarshipId: string) => {
    setConfirmDeleteId(scholarshipId);
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId) {
      setIsLoading(true);
      const success = await deleteScholarship(confirmDeleteId);
      
      if (success) {
        setScholarships(scholarships.filter(s => s.id !== confirmDeleteId));
      }
      
      setConfirmDeleteId(null);
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true);
    
    try {
      if (currentScholarship?.id) {
        // Update existing scholarship
        const updatedScholarship = await updateScholarship(
          currentScholarship.id,
          {
            name: formData.name,
            country: formData.country,
            description: formData.description,
            deadline: formData.deadline,
            website: formData.website
          }
        );
        
        if (updatedScholarship) {
          setScholarships(scholarships.map(s => 
            s.id === currentScholarship.id ? updatedScholarship : s
          ));
        }
      } else {
        // Create new scholarship
        const newScholarship = await createScholarship({
          name: formData.name,
          country: formData.country,
          description: formData.description,
          deadline: formData.deadline,
          website: formData.website
        });
        
        if (newScholarship) {
          setScholarships([newScholarship, ...scholarships]);
        }
      }
    } catch (error) {
      console.error('Error saving scholarship:', error);
    } finally {
      setIsLoading(false);
      setIsFormOpen(false);
    }
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-800">Scholarships</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddNewScholarship}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-300"
        >
          <Plus size={18} />
          <span>Add Scholarship</span>
        </motion.button>
      </div>

      {/* Search and Filters */}
      <SearchAndFilter
        searchPlaceholder="Search scholarships by name, country..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && scholarships.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
          <h3 className="text-xl font-medium text-neutral-800 mb-2">No Scholarships Yet</h3>
          <p className="text-neutral-600 mb-6">
            Start by adding your first scholarship to track opportunities.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNewScholarship}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-300"
          >
            <Plus size={18} />
            <span>Add Scholarship</span>
          </motion.button>
        </div>
      )}

      {/* Scholarship List */}
      {!isLoading && scholarships.length > 0 && (
        <ScholarshipListView 
          scholarships={filteredScholarships} 
          onEdit={handleEditScholarship}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Scholarship Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <ScholarshipFormModal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
            scholarship={currentScholarship}
            countries={countries}
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