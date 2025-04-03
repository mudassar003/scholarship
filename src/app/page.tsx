//src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, ChevronDown, Edit2, Trash2, Clock, Check, X } from 'lucide-react';
import DeleteConfirmationModal from '@/app/professors/components/DeleteConfirmationModal';
import { getProfessors, deleteProfessor } from '@/services/professorService';
import { updateProfessorStatus } from '@/services/statusService';
import QuickEditModal from '@/components/QuickEditModal';
import Link from 'next/link';

// Define the Email interface
interface Email {
  id: string;
  professor: string;
  university: string;
  country: string;
  scholarship: string;
  status: string;
  emailScreenshot: string | null;
  proposalPdf: string | null;
}

export default function Home(): React.ReactNode {
  const [emails, setEmails] = useState<Email[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEmail, setCurrentEmail] = useState<Email | null>(null);
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const professorsData = await getProfessors();
      // Transform professors data into email tracking format
      const emailsData: Email[] = professorsData.map(professor => ({
        id: professor.id || '',  // Fallback to empty string if undefined
        professor: professor.name,
        university: professor.university_name || 'Unknown University',
        country: professor.country || 'Unknown Country',
        scholarship: professor.research || 'Research Scholarship',
        status: professor.status || 'Pending',
        emailScreenshot: professor.email_screenshot?.url || null,
        proposalPdf: professor.proposal?.url || null
      }));
      setEmails(emailsData);
    } catch (error) {
      console.error('Error fetching professors data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter emails based on search term and active filter
  const filteredEmails = emails.filter(email => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      email.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.scholarship.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    let matchesStatus = activeFilter === 'all';
    
    if (activeFilter === 'pending' && email.status === 'Pending') matchesStatus = true;
    if (activeFilter === 'replied' && email.status === 'Replied') matchesStatus = true;
    if (activeFilter === 'rejected' && email.status === 'Rejected') matchesStatus = true;
    
    return matchesSearch && matchesStatus;
  });

  // Handle regular edit (navigate to full edit page)
  const handleEditEmail = (email: Email) => {
    window.location.href = `/professors?edit=${email.id}`;
  };

  // Handle quick edit (show modal)
  const handleQuickEdit = (email: Email) => {
    setCurrentEmail(email);
    setIsQuickEditOpen(true);
  };

  const handleDeleteEmail = (emailId: string) => {
    setConfirmDeleteId(emailId);
  };

  const confirmDeleteEmail = async () => {
    if (confirmDeleteId) {
      try {
        setIsLoading(true);
        // Delete the professor using the service
        const success = await deleteProfessor(confirmDeleteId);
        
        if (success) {
          setEmails(emails.filter(email => email.id !== confirmDeleteId));
        }
      } catch (error) {
        console.error('Error deleting professor:', error);
      } finally {
        setConfirmDeleteId(null);
        setIsLoading(false);
      }
    }
  };

  // Save quick edit changes
  const handleSaveQuickEdit = async (emailId: string, updates: { status: string, notes?: string }) => {
    try {
      // Update the status in the database
      const success = await updateProfessorStatus(emailId, updates.status);
      
      if (success) {
        // Update local state
        setEmails(emails.map(email => 
          email.id === emailId 
            ? { ...email, status: updates.status } 
            : email
        ));
      }
      
      return success;
    } catch (error) {
      console.error('Error updating from quick edit:', error);
      return false;
    }
  };

  // Update status from dropdown
  const handleStatusChange = async (emailId: string, newStatus: string) => {
    try {
      // Update the status in the database
      const success = await updateProfessorStatus(emailId, newStatus);
      
      if (success) {
        // Update local state
        setEmails(emails.map(email => 
          email.id === emailId 
            ? { ...email, status: newStatus } 
            : email
        ));
      }
      
      return success;
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    }
  };

  const handleAddNewEmail = () => {
    // Navigate to professor creation page
    window.location.href = '/professors?new=true';
  };

  const handleViewDocument = (url: string | null, type: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      console.error(`No ${type} document available.`);
    }
  };

  return (
    <div>
      {/* Hero Section with Search Bar - Full Width, Properly Aligned */}
      <div className="w-full bg-neutral-100 py-8">
        <div className="max-w-7xl mx-auto text-center px-4">         
          {/* Centered Search Bar */}
          <div className="relative max-w-3xl mx-auto mb-8">
            <input
              type="text"
              placeholder="Search professors, universities, scholarships..."
              className="w-full bg-white border border-neutral-200 rounded-xl pl-14 pr-5 py-4 text-neutral-700 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all duration-300 shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400">
              <Search size={20} />
            </div>
          </div>
          
          {/* Filter Buttons in one line */}
          <div className="flex justify-center mb-0 overflow-x-auto whitespace-nowrap gap-2 px-4">
            <button 
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                activeFilter === 'all' ? 'bg-neutral-800 text-white shadow-md' : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              All Emails
            </button>
            <button 
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeFilter === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200'
              }`}
              onClick={() => setActiveFilter('pending')}
            >
              <Clock size={16} />
              Pending
            </button>
            <button 
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeFilter === 'replied' ? 'bg-emerald-500 text-white shadow-md' : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200'
              }`}
              onClick={() => setActiveFilter('replied')}
            >
              <Check size={16} />
              Replied
            </button>
            <button 
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeFilter === 'rejected' ? 'bg-rose-500 text-white shadow-md' : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200'
              }`}
              onClick={() => setActiveFilter('rejected')}
            >
              <X size={16} />
              Rejected
            </button>
            
            {/* New Email Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNewEmail}
              className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 shadow-md ml-2"
            >
              <Plus size={16} />
              New Email
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content Section - Email Results */}
      <div className="w-full max-w-7xl mx-auto px-4 py-10">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredEmails.length === 0 && (
          <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-12 text-center">
            <h3 className="text-xl font-medium text-neutral-800 mb-2">No Emails Found</h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm || activeFilter !== 'all' 
                ? 'Try adjusting your search or filters to find more results.' 
                : 'Start by adding your first professor to track emails.'}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNewEmail}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <Plus size={16} />
              Add Professor
            </motion.button>
          </div>
        )}

        {/* Email List Table */}
        {!isLoading && filteredEmails.length > 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-lg">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="text-left py-4 px-5 text-sm font-medium text-neutral-500">PROFESSOR</th>
                  <th className="text-left py-4 px-5 text-sm font-medium text-neutral-500">UNIVERSITY</th>
                  <th className="text-left py-4 px-5 text-sm font-medium text-neutral-500">COUNTRY</th>
                  <th className="text-left py-4 px-5 text-sm font-medium text-neutral-500">SCHOLARSHIP</th>
                  <th className="text-left py-4 px-5 text-sm font-medium text-neutral-500">STATUS</th>
                  <th className="text-center py-4 px-5 text-sm font-medium text-neutral-500">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.map((email) => (
                  <tr key={email.id} className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <ChevronDown size={16} className="text-neutral-400" />
                        <span className="font-medium text-neutral-800">{email.professor}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-neutral-600">{email.university}</td>
                    <td className="py-4 px-5 text-neutral-600">{email.country}</td>
                    <td className="py-4 px-5 text-neutral-600">{email.scholarship}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        email.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        email.status === 'Replied' ? 'bg-green-100 text-green-800' :
                        email.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-neutral-100 text-neutral-800'
                      }`}>
                        {email.status}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleEditEmail(email)}
                          className="p-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEmail(email.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <DeleteConfirmationModal
            isOpen={!!confirmDeleteId}
            onClose={() => setConfirmDeleteId(null)}
            onConfirm={confirmDeleteEmail}
          />
        )}
      </AnimatePresence>

      {/* Quick Edit Modal */}
      <AnimatePresence>
        {isQuickEditOpen && (
          <QuickEditModal
            isOpen={isQuickEditOpen}
            onClose={() => setIsQuickEditOpen(false)}
            email={currentEmail}
            onSave={handleSaveQuickEdit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}