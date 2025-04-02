// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Sample email tracking data
const emailTrackingData = [
  {
    id: '1',
    professor: 'Dr. John Smith',
    university: 'MIT',
    country: 'United States',
    scholarship: 'Research Grant',
    status: 'Replied',
    emailScreenshot: '/sample-screenshot.png',
    proposalPdf: '/sample-proposal.pdf'
  },
  {
    id: '2',
    professor: 'Dr. Emma Watson',
    university: 'Oxford University',
    country: 'United Kingdom',
    scholarship: 'Postdoctoral Fellowship',
    status: 'Pending',
    emailScreenshot: '/sample-screenshot-2.png',
    proposalPdf: '/sample-proposal-2.pdf'
  }
];

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const filters = [
    { id: 'all', label: 'All Emails' },
    { id: 'pending', label: 'Pending' },
    { id: 'replied', label: 'Replied' },
    { id: 'rejected', label: 'Rejected' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Replied': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const handleViewDocument = (documentUrl: string, type: 'screenshot' | 'proposal') => {
    window.open(documentUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-900">
      <div className="container mx-auto px-6 py-10 max-w-7xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-neutral-800 hover:text-neutral-900 transition-colors"
          >
            ScholarSync
          </motion.div>
          
          <nav className="flex items-center space-x-8">
            {['Professors', 'Countries', 'Scholarships', 'Dashboard'].map((item) => (
              <motion.a
                key={item}
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors duration-300"
              >
                {item}
              </motion.a>
            ))}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-neutral-800 text-white hover:bg-neutral-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
            >
              New Email
            </motion.button>
          </nav>
        </header>

        <main>
          {/* Search and Filters section */}
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
                  placeholder="Search professors, universities, scholarships..."
                  className="w-full bg-white border border-neutral-200 rounded-xl px-6 py-4 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all duration-300 shadow-sm"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>

              {/* Filters */}
              <div className="flex justify-center space-x-4 mt-6">
                {filters.map((filter) => (
                  <motion.button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
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

          {/* Email Tracking Table */}
          <section>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-lg"
            >
              <div className="px-6 py-4 border-b border-neutral-200">
                <h2 className="text-lg font-semibold text-neutral-800">Email Tracking</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-600">
                    {['Professor', 'University', 'Country', 'Scholarship', 'Status', 'Actions'].map((header) => (
                      <th key={header} className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {emailTrackingData.map((row) => (
                    <tr 
                      key={row.id}
                      className="border-b border-neutral-200 hover:bg-neutral-100 transition-colors duration-300"
                    >
                      <td className="px-6 py-4">{row.professor}</td>
                      <td className="px-6 py-4">{row.university}</td>
                      <td className="px-6 py-4">{row.country}</td>
                      <td className="px-6 py-4">{row.scholarship}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {/* Edit Button */}
                          <button 
                            className="text-neutral-500 hover:text-blue-600 transition-colors p-1 rounded"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>

                          {/* Delete Button */}
                          <button 
                            className="text-neutral-500 hover:text-red-600 transition-colors p-1 rounded"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>

                          {/* View Email Screenshot Button */}
                          <button 
                            onClick={() => handleViewDocument(row.emailScreenshot, 'screenshot')}
                            className="text-neutral-500 hover:text-blue-600 transition-colors p-1 rounded"
                            title="View Email Screenshot"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </button>

                          {/* View Proposal Button */}
                          <button 
                            onClick={() => handleViewDocument(row.proposalPdf, 'proposal')}
                            className="text-neutral-500 hover:text-green-600 transition-colors p-1 rounded"
                            title="View Proposal"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </section>
        </main>
      </div>
    </div>
  );
}