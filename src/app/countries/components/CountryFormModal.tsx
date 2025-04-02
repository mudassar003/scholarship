// src/app/countries/components/CountryFormModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Flag } from 'lucide-react';
import { Country } from '@/types';

interface CountryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CountryFormData) => void;
  country?: Country | null;
}

export interface CountryFormData {
  name: string;
  code: string;
  flag: string;
}

// Common country flags for easy selection
const commonFlags = [
  { emoji: '🇺🇸', name: 'United States' },
  { emoji: '🇬🇧', name: 'United Kingdom' },
  { emoji: '🇨🇦', name: 'Canada' },
  { emoji: '🇦🇺', name: 'Australia' },
  { emoji: '🇩🇪', name: 'Germany' },
  { emoji: '🇫🇷', name: 'France' },
  { emoji: '🇯🇵', name: 'Japan' },
  { emoji: '🇨🇳', name: 'China' },
  { emoji: '🇮🇳', name: 'India' },
  { emoji: '🇧🇷', name: 'Brazil' },
  { emoji: '🇮🇹', name: 'Italy' },
  { emoji: '🇪🇸', name: 'Spain' }
];

const CountryFormModal: React.FC<CountryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  country = null,
}) => {
  const [formData, setFormData] = useState<CountryFormData>({
    name: '',
    code: '',
    flag: '',
  });

  useEffect(() => {
    if (country) {
      setFormData({
        name: country.name,
        code: country.code,
        flag: country.flag || '',
      });
    } else {
      // Reset form for new country
      setFormData({
        name: '',
        code: '',
        flag: '',
      });
    }
  }, [country, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const selectFlag = (emoji: string) => {
    setFormData({...formData, flag: emoji});
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
            {country ? 'Edit Country' : 'Add New Country'}
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
              Country Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="United States"
              required
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-neutral-700 mb-1">
              Country Code
            </label>
            <input
              type="text"
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
              className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="US"
              maxLength={2}
              required
            />
            <p className="text-sm text-neutral-500 mt-1">Two-letter country code (ISO 3166-1 alpha-2)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Country Flag
            </label>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg border border-neutral-300 flex items-center justify-center text-2xl">
                {formData.flag || <Flag size={24} className="text-neutral-400" />}
              </div>
              <input
                type="text"
                value={formData.flag}
                onChange={(e) => setFormData({...formData, flag: e.target.value})}
                className="flex-1 border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="🇺🇸"
                maxLength={4}
              />
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium text-neutral-700 mb-2">Common Flags:</p>
              <div className="flex flex-wrap gap-2">
                {commonFlags.map((flagItem) => (
                  <button
                    key={flagItem.name}
                    type="button"
                    onClick={() => selectFlag(flagItem.emoji)}
                    className="w-10 h-10 flex items-center justify-center text-xl bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                    title={flagItem.name}
                  >
                    {flagItem.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors duration-300"
            >
              {country ? 'Update Country' : 'Add Country'}
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

export default CountryFormModal;