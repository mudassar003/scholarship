// src/app/universities/components/UniversityFormModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { University, Country } from '@/types';

interface UniversityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UniversityFormData) => void;
  university?: University | null;
  countries: Country[];
}

export interface UniversityFormData {
  name: string;
  country: string;
  city: string;
  website: string;
}

const UniversityFormModal: React.FC<UniversityFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  university = null,
  countries,
}) => {
  const [formData, setFormData] = useState<UniversityFormData>({
    name: '',
    country: '',
    city: '',
    website: '',
  });

  useEffect(() => {
    if (university) {
      setFormData({
        name: university.name,
        country: university.country || '',
        city: university.city || '',
        website: university.website || '',
      });
    } else {
      // Reset form for new university
      setFormData({
        name: '',
        country: '',
        city: '',
        website: '',
      });
    }
  }, [university, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
            {university ? 'Edit University' : 'Add New University'}
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
              University Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Massachusetts Institute of Technology"
              required
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
                <option key={country.id} value={country.name}>{country.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Cambridge"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-neutral-700 mb-1">
              Website URL
            </label>
            <input
              type="url"
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="https://example.edu"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors duration-300"
            >
              {university ? 'Update University' : 'Add University'}
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

export default UniversityFormModal;