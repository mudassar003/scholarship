// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import SearchAndFilter from '@/components/SearchAndFilter';
import EmailList from '@/components/EmailList';
import ActionButton from '@/components/ActionButton';
import QuickEditModal from '@/components/QuickEditModal';
import { Plus } from 'lucide-react';
import DeleteConfirmationModal from '@/app/professors/components/DeleteConfirmationModal';
import { getProfessors, deleteProfessor } from '@/services/professorService';
import { updateProfessorStatus } from '@/services/statusService';
import { toast } from 'react-hot-toast'; // Add react-hot-toast package for notifications

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

export default function Home() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEmail, setCurrentEmail] = useState<Email | null>(null);
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);

  const filters = [
    { id: 'all', label: 'All Emails' },
    { id: 'pending', label: 'Pending' },
    { id: 'replied', label: 'Replied' },
    { id: 'rejected', label: 'Rejected' }
  ];

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
      toast.error('Failed to load email data');
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
          toast.success('Email record deleted successfully');
        } else {
          toast.error('Failed to delete the record');
        }
      } catch (error) {
        console.error('Error deleting professor:', error);
        toast.error('An error occurred while deleting');
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
        toast.success(`Status updated to ${updates.status}`);
      } else {
        toast.error('Failed to update status');
      }
      
      return success;
    } catch (error) {
      console.error('Error updating from quick edit:', error);
      toast.error('An error occurred while updating');
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
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update status');
      }
      
      return success;
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('An error occurred while updating status');
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
      toast.error(`No ${type} document available.`);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-800">Email Tracking</h1>
        <ActionButton
          icon={Plus}
          label="New Email"
          onClick={handleAddNewEmail}
          variant="primary"
          size="lg"
          showLabel={true}
        />
      </div>

      {/* Search and Filters section */}
      <SearchAndFilter
        searchPlaceholder="Search professors, universities, scholarships..."
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
      {!isLoading && filteredEmails.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
          <h3 className="text-xl font-medium text-neutral-800 mb-2">No Emails Found</h3>
          <p className="text-neutral-600 mb-6">
            {searchTerm || activeFilter !== 'all' 
              ? 'Try adjusting your search or filters to find more results.' 
              : 'Start by adding your first professor to track emails.'}
          </p>
          <ActionButton
            icon={Plus}
            label="Add Professor"
            onClick={handleAddNewEmail}
            variant="primary"
            size="lg"
            showLabel={true}
          />
        </div>
      )}

      {/* Email Tracking Table */}
      {!isLoading && filteredEmails.length > 0 && (
        <section>
          <EmailList 
            emails={filteredEmails} 
            onEdit={handleEditEmail}
            onDelete={handleDeleteEmail}
            onViewEmail={(emailScreenshot) => handleViewDocument(emailScreenshot, 'email screenshot')}
            onViewProposal={(proposalPdf) => handleViewDocument(proposalPdf, 'proposal')}
            onStatusChange={handleStatusChange}
            onQuickEdit={handleQuickEdit}
          />
        </section>
      )}

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