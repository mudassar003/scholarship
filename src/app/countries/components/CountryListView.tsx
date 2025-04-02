// src/app/countries/components/CountryListView.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Country } from '@/types';
import { getUniversitiesByCountry } from '@/services/universityService';
import { getScholarshipsByCountry } from '@/services/scholarshipService';
import { ChevronDown, ChevronUp, Edit2, Trash2, Building, GraduationCap, Flag } from 'lucide-react';

// Define more specific types for universities and scholarships
interface University {
  id: string;
  name: string;
  city?: string;
}

interface Scholarship {
  id: string;
  name: string;
  deadline?: string;
}

interface CountryListViewProps {
  countries: Country[];
  onEdit: (country: Country) => void;
  onDelete: (countryId: string) => void;
}

const CountryListView: React.FC<CountryListViewProps> = ({ countries, onEdit, onDelete }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [universities, setUniversities] = useState<Record<string, University[]>>({});
  const [scholarships, setScholarships] = useState<Record<string, Scholarship[]>>({});
  const [loadingData, setLoadingData] = useState<Record<string, boolean>>({});

  const toggleExpandRow = async (id: string, countryName: string) => {
    // If closing an expanded row, just close it
    if (expandedRow === id) {
      setExpandedRow(null);
      return;
    }
    
    // Otherwise, fetch data for the country and expand
    setExpandedRow(id);
    
    // If we already have data for this country, don't fetch it again
    if (universities[id] || scholarships[id]) {
      return;
    }
    
    setLoadingData(prev => ({...prev, [id]: true}));
    
    try {
      // Fetch related data for the country
      const [univData, scholarData] = await Promise.all([
        getUniversitiesByCountry(id),
        getScholarshipsByCountry(countryName)
      ]);
      
      setUniversities(prev => ({...prev, [id]: univData}));
      setScholarships(prev => ({...prev, [id]: scholarData}));
    } catch (error) {
      console.error('Error fetching data for country:', error);
    } finally {
      setLoadingData(prev => ({...prev, [id]: false}));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* List Header */}
      <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 grid grid-cols-12 gap-4 text-sm font-medium text-neutral-500">
        <div className="col-span-1">FLAG</div>
        <div className="col-span-4">COUNTRY NAME</div>
        <div className="col-span-3">CODE</div>
        <div className="col-span-2">SCHOLARSHIPS</div>
        <div className="col-span-2">ACTIONS</div>
      </div>

      {/* List Items */}
      {countries.length === 0 ? (
        <div className="px-6 py-10 text-center text-neutral-500">
          No countries found. Add your first country to get started.
        </div>
      ) : (
        countries.map((country) => (
          <React.Fragment key={country.id}>
            <div 
              className={`px-6 py-4 border-b border-neutral-200 grid grid-cols-12 gap-4 items-center hover:bg-neutral-50 transition-colors cursor-pointer ${
                expandedRow === country.id ? 'bg-neutral-50' : ''
              }`}
              onClick={() => toggleExpandRow(country.id, country.name)}
            >
              <div className="col-span-1 font-medium text-neutral-800">
                {country.flag ? (
                  <span className="text-2xl">{country.flag}</span>
                ) : (
                  <Flag size={24} className="text-neutral-400" />
                )}
              </div>
              
              <div className="col-span-4 font-medium text-neutral-800 flex items-center gap-2">
                {expandedRow === country.id ? (
                  <ChevronUp size={18} className="text-neutral-400" />
                ) : (
                  <ChevronDown size={18} className="text-neutral-400" />
                )}
                {country.name}
              </div>
              
              <div className="col-span-3 text-neutral-600 uppercase">
                {country.code}
              </div>
              
              <div className="col-span-2 text-neutral-600">
                {country.scholarships?.length || 0}
              </div>
              
              <div className="col-span-2 flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(country);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors p-1"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(country.id);
                  }}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Expanded Row with Details */}
            <AnimatePresence>
              {expandedRow === country.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-neutral-50 border-b border-neutral-200 overflow-hidden"
                >
                  <div className="p-6 grid grid-cols-1 gap-6">
                    {/* Loading state */}
                    {loadingData[country.id] && (
                      <div className="flex justify-center items-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    )}

                    {!loadingData[country.id] && (
                      <>
                        {/* Universities in this country */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-neutral-800 flex items-center gap-2">
                            <Building size={16} className="text-indigo-500" />
                            Universities ({universities[country.id]?.length || 0})
                          </h4>
                          {universities[country.id]?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {universities[country.id]?.slice(0, 6).map((university) => (
                                <div key={university.id} className="p-2 rounded bg-white border border-neutral-200">
                                  <p className="font-medium text-neutral-800">{university.name}</p>
                                  <p className="text-sm text-neutral-500">{university.city || 'No city'}</p>
                                </div>
                              ))}
                              {universities[country.id]?.length > 6 && (
                                <div className="p-2 text-center text-sm text-neutral-500">
                                  +{universities[country.id].length - 6} more universities
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-neutral-500">No universities found for this country</p>
                          )}
                        </div>

                        {/* Scholarships in this country */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-neutral-800 flex items-center gap-2">
                            <GraduationCap size={16} className="text-indigo-500" />
                            Scholarships ({scholarships[country.id]?.length || 0})
                          </h4>
                          {scholarships[country.id]?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {scholarships[country.id]?.slice(0, 6).map((scholarship) => (
                                <div key={scholarship.id} className="p-2 rounded bg-white border border-neutral-200">
                                  <p className="font-medium text-neutral-800">{scholarship.name}</p>
                                  <p className="text-sm text-neutral-500">
                                    {scholarship.deadline ? 
                                      `Deadline: ${new Date(scholarship.deadline).toLocaleDateString()}` : 
                                      'No deadline'}
                                  </p>
                                </div>
                              ))}
                              {scholarships[country.id]?.length > 6 && (
                                <div className="p-2 text-center text-sm text-neutral-500">
                                  +{scholarships[country.id].length - 6} more scholarships
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-neutral-500">No scholarships found for this country</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </React.Fragment>
        ))
      )}
    </div>
  );
};

export default CountryListView;