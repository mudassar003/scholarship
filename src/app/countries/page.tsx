//src/app/countries/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Country } from '@/types';
import { Plus, Search, Globe } from 'lucide-react';
import { getCountries, createCountry, updateCountry, deleteCountry } from '@/services/countryService';
import CountryListView from './components/CountryListView';
import CountryFormModal from './components/CountryFormModal';
import DeleteConfirmationModal from '@/app/professors/components/DeleteConfirmationModal';

// Define the shape of the form data
interface CountryFormData {
  name: string;
  code: string;
  flag?: string;
}

export default function CountriesPage(): React.ReactNode {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    // Fetch data from Supabase when component mounts
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      
      try {
        const countriesData = await getCountries();
        setCountries(countriesData);
        setFilteredCountries(countriesData);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter countries based on search term
  useEffect(() => {
    const filtered = countries.filter(country => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
    
    setFilteredCountries(filtered);
  }, [countries, searchTerm]);

  const handleAddNewCountry = (): void => {
    setCurrentCountry(null);
    setIsFormOpen(true);
  };

  const handleEditCountry = (country: Country): void => {
    setCurrentCountry(country);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (countryId: string): void => {
    setConfirmDeleteId(countryId);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
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

  const handleFormSubmit = async (formData: CountryFormData): Promise<void> => {
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
    <div className="w-full bg-neutral-50">
      {/* Hero Section with Search Bar - Full Width */}
      <div className="w-full bg-neutral-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-grow max-w-2xl">
              <input
                type="text"
                placeholder="Search countries by name or code..."
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
              onClick={handleAddNewCountry}
              className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 shadow-md"
            >
              <Plus size={16} />
              <Globe size={16} className="ml-1" />
              Add Country
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
        {!isLoading && countries.length === 0 && (
          <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-12 text-center">
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
    </div>
  );
}