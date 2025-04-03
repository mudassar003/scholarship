//src/app/scholarships/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scholarship, Country } from '@/types';
import { Plus, Search, Calendar } from 'lucide-react';
import { getScholarships, createScholarship, updateScholarship, deleteScholarship } from '@/services/scholarshipService';
import { getCountries } from '@/services/countryService';
import ScholarshipListView from './components/ScholarshipListView';
import ScholarshipFormModal from './components/ScholarshipFormModal';
import DeleteConfirmationModal from '@/app/professors/components/DeleteConfirmationModal';

// Define the form data interface
interface ScholarshipFormData {
  name: string;
  country: string;
  description?: string;
  deadline?: string;
  website?: string;
}

export default function ScholarshipsPage(): React.ReactNode {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentScholarship, setCurrentScholarship] = useState<Scholarship | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Define filters
  const filters = [
    { id: 'all', label: 'All Scholarships' },
    { id: 'upcoming', label: 'Upcoming Deadlines' },
    { id: 'past', label: 'Past Deadlines' }
  ];

  useEffect(() => {
    // Fetch data from Supabase when component mounts
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      
      try {
        const [scholarshipsData, countriesData] = await Promise.all([
          getScholarships(),
          getCountries()
        ]);
        
        setScholarships(scholarshipsData);
        setFilteredScholarships(scholarshipsData);
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
  useEffect(() => {
    const filtered = scholarships.filter(scholarship => {
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
    
    setFilteredScholarships(filtered);
  }, [scholarships, searchTerm, activeFilter]);

  const handleAddNewScholarship = (): void => {
    setCurrentScholarship(null);
    setIsFormOpen(true);
  };

  const handleEditScholarship = (scholarship: Scholarship): void => {
    setCurrentScholarship(scholarship);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (scholarshipId: string): void => {
    setConfirmDeleteId(scholarshipId);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
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

  const handleFormSubmit = async (formData: ScholarshipFormData): Promise<void> => {
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
    <div className="w-full bg-neutral-50">
      {/* Hero Section with Search Bar - Full Width */}
      <div className="w-full bg-neutral-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-grow max-w-2xl">
              <input
                type="text"
                placeholder="Search scholarships by name, country, description..."
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
              onClick={handleAddNewScholarship}
              className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 shadow-md"
            >
              <Plus size={16} />
              Add Scholarship
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
                {filter.id === 'upcoming' && <Calendar size={16} className="inline mr-1" />}
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
        {!isLoading && scholarships.length === 0 && (
          <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-12 text-center">
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
    </div>
  );
}