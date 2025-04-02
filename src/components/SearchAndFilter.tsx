// src/components/SearchAndFilter.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FilterItem {
  id: string;
  label: string;
}

interface SearchAndFilterProps {
  searchPlaceholder?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: FilterItem[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchPlaceholder = "Search...",
  searchTerm,
  onSearchChange,
  filters,
  activeFilter,
  onFilterChange
}) => {
  return (
    <section className="mb-12">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="relative">
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-xl px-6 py-4 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all duration-300 shadow-sm"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-center space-x-4 mt-6 flex-wrap">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 mb-2
                ${activeFilter === filter.id 
                  ? 'bg-neutral-800 text-white' 
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'}
              `}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default SearchAndFilter;