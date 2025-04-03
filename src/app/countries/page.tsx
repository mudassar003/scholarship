//src/app/countries/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Country } from '@/types';
import { Plus } from 'lucide-react';
import { getCountries, createCountry, updateCountry, deleteCountry } from '@/services/countryService';
import CountryListView from './components/CountryListView';
import CountryFormModal from './components/CountryFormModal';
import DeleteConfirmationModal from '@/app/professors/components/DeleteConfirmationModal';
import SearchAndFilter from '@/components/SearchAndFilter';

// Define the shape of the form data
interface CountryFormData {
  name: string;
  code: string;
  flag?: string;
}

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Define filters
  const filters = [
    { id: 'all', label: 'All Countries' }
  ];

  useEffect(() => {
    // Fetch data from Supabase when component mounts
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const countriesData = await getCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter countries based on search term
  const filteredCountries = countries.filter(country => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleAddNewCountry = () => {
    setCurrentCountry(null);
    setIsFormOpen(true);
  };

  const handleEditCountry = (country: Country) => {
    setCurrentCountry(country);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (countryId: string) => {
    setConfirmDeleteId(countryId);
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId) {
      setIsLoading(true);
      const success = await deleteCountry(confirmDeleteId);
      
      if (success) {
        setCountries(countries.filter(c => c.id !== confirmDeleteId));
      }
      
      setConfirmDeleteId(null);
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: CountryFormData) => {
    setIsLoading(true);
    
    try {
      if (currentCountry?.id) {
        // Update existing country
        const updatedCountry = await updateCountry(
          currentCountry.id,
          {
            name: formData.name,
            code: formData.code,
            flag: formData.flag
          }
        );
        
        if (updatedCountry) {
          setCountries(countries.map(c => 
            c.id === currentCountry.id ? updatedCountry : c
          ));
        }
      } else {
        // Create new country
        const newCountry = await createCountry({
          name: formData.name,
          code: formData.code,
          flag: formData.flag,
          scholarships: []
        });
        
        if (newCountry) {
          setCountries([newCountry, ...countries]);
        }
      }
    } catch (error) {
      console.error('Error saving country:', error);
    } finally {
      setIsLoading(false);
      setIsFormOpen(false);
    }
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-800">Countries</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddNewCountry}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-300"
        >
          <Plus size={18} />
          <span>Add Country</span>
        </motion.button>
      </div>

      {/* Search and Filters */}
      <SearchAndFilter
        searchPlaceholder="Search countries by name or code..."
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
      {!isLoading && countries.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
          <h3 className="text-xl font-medium text-neutral-800 mb-2">No Countries Yet</h3>
          <p className="text-neutral-600 mb-6">
            Start by adding countries for organizing scholarships and universities.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNewCountry}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-300"
          >
            <Plus size={18} />
            <span>Add Country</span>
          </motion.button>
        </div>
      )}

      {/* Countries List */}
      {!isLoading && countries.length > 0 && (
        <CountryListView 
          countries={filteredCountries} 
          onEdit={handleEditCountry}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Country Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <CountryFormModal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
            country={currentCountry}
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