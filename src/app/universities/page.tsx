//src/app/universities/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { University, Country } from '@/types';
import { Plus, Search, Building } from 'lucide-react';
import { getUniversities, createUniversity, updateUniversity, deleteUniversity } from '@/services/universityService';
import { getCountries } from '@/services/countryService';
import UniversityListView from './components/UniversityListView';
import UniversityFormModal from './components/UniversityFormModal';
import DeleteConfirmationModal from '@/app/professors/components/DeleteConfirmationModal';

// Define the interface for the form data
interface UniversityFormData {
  name: string;
  country: string;
  city?: string;
  website?: string;
}

export default function UniversitiesPage(): React.ReactNode {
  const [universities, setUniversities] = useState<University[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentUniversity, setCurrentUniversity] = useState<University | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    // Fetch data from Supabase when component mounts
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      
      try {
        const [universitiesData, countriesData] = await Promise.all([
          getUniversities(),
          getCountries()
        ]);
        
        setUniversities(universitiesData);
        setFilteredUniversities(universitiesData);
        setCountries(countriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter universities based on search term and active filter
  useEffect(() => {
    const filtered = universities.filter(university => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (university.country && university.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (university.city && university.city.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
    
    setFilteredUniversities(filtered);
  }, [universities, searchTerm]);

  const handleAddNewUniversity = (): void => {
    setCurrentUniversity(null);
    setIsFormOpen(true);
  };

  const handleEditUniversity = (university: University): void => {
    setCurrentUniversity(university);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (universityId: string): void => {
    setConfirmDeleteId(universityId);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (confirmDeleteId) {
      setIsLoading(true);
      const success = await deleteUniversity(confirmDeleteId);
      
      if (success) {
        setUniversities(universities.filter(u => u.id !== confirmDeleteId));
      }
      
      setConfirmDeleteId(null);
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: UniversityFormData): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Find the country ID based on selected country name
      const selectedCountry = countries.find(c => c.name === formData.country);
      
      if (currentUniversity?.id) {
        // Update existing university
        const updatedUniversity = await updateUniversity(
          currentUniversity.id,
          {
            name: formData.name,
            country: formData.country,
            country_id: selectedCountry?.id,
            city: formData.city,
            website: formData.website
          }
        );
        
        if (updatedUniversity) {
          setUniversities(universities.map(u => 
            u.id === currentUniversity.id ? updatedUniversity : u
          ));
        }
      } else {
        // Create new university
        const newUniversity = await createUniversity({
          name: formData.name,
          country: formData.country,
          country_id: selectedCountry?.id,
          city: formData.city,
          website: formData.website
        });
        
        if (newUniversity) {
          setUniversities([newUniversity, ...universities]);
        }
      }
    } catch (error) {
      console.error('Error saving university:', error);
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
                placeholder="Search universities by name, country, city..."
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
              onClick={handleAddNewUniversity}
              className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 shadow-md"
            >
              <Plus size={16} />
              <Building size={16} className="ml-1" />
              Add University
            </motion.button>
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
        {!isLoading && universities.length === 0 && (
          <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-12 text-center">
            <h3 className="text-xl font-medium text-neutral-800 mb-2">No Universities Yet</h3>
            <p className="text-neutral-600 mb-6">
              Start by adding your first university to track academic institutions.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNewUniversity}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-300"
            >
              <Plus size={18} />
              <span>Add University</span>
            </motion.button>
          </div>
        )}

        {/* University List */}
        {!isLoading && universities.length > 0 && (
          <UniversityListView 
            universities={filteredUniversities} 
            onEdit={handleEditUniversity}
            onDelete={handleDeleteClick}
          />
        )}

        {/* University Form Modal */}
        <AnimatePresence>
          {isFormOpen && (
            <UniversityFormModal
              isOpen={isFormOpen}
              onClose={() => setIsFormOpen(false)}
              onSubmit={handleFormSubmit}
              university={currentUniversity}
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