'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { University, Country } from '@/types';
import { Plus } from 'lucide-react';
import { getUniversities, createUniversity, updateUniversity, deleteUniversity } from '@/services/universityService';
import { getCountries } from '@/services/countryService';
import UniversityListView from './components/UniversityListView';
import UniversityFormModal from './components/UniversityFormModal';
import DeleteConfirmationModal from '@/app/professors/components/DeleteConfirmationModal';
import SearchAndFilter from '@/components/SearchAndFilter';

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentUniversity, setCurrentUniversity] = useState<University | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Define filters
  const filters = [
    { id: 'all', label: 'All Universities' }
  ];

  useEffect(() => {
    // Fetch data from Supabase when component mounts
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const [universitiesData, countriesData] = await Promise.all([
          getUniversities(),
          getCountries()
        ]);
        
        setUniversities(universitiesData);
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
  const filteredUniversities = universities.filter(university => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (university.country && university.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (university.city && university.city.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // We're not doing any specific filtering by category yet, so return all that match search
    return matchesSearch;
  });

  const handleAddNewUniversity = () => {
    setCurrentUniversity(null);
    setIsFormOpen(true);
  };

  const handleEditUniversity = (university: University) => {
    setCurrentUniversity(university);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (universityId: string) => {
    setConfirmDeleteId(universityId);
  };

  const handleDeleteConfirm = async () => {
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

  const handleFormSubmit = async (formData: any) => {
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
    <div className="py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-800">Universities</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddNewUniversity}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-300"
        >
          <Plus size={18} />
          <span>Add University</span>
        </motion.button>
      </div>

      {/* Search and Filters */}
      <SearchAndFilter
        searchPlaceholder="Search universities by name, country, city..."
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
      {!isLoading && universities.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
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
  );
}