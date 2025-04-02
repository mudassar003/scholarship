// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import SearchAndFilter from '@/components/SearchAndFilter';
import EmailList from '@/components/EmailList';
import ActionButton from '@/components/ActionButton';
import { Plus } from 'lucide-react';
import DeleteConfirmationModal from '@/app/professors/components/DeleteConfirmationModal';

// Sample email tracking data
const initialEmails = [
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
  },
  {
    id: '3',
    professor: 'Dr. Michael Chen',
    university: 'University of Toronto',
    country: 'Canada',
    scholarship: 'Graduate Scholarship',
    status: 'Pending',
    emailScreenshot: '/sample-screenshot-3.png',
    proposalPdf: '/sample-proposal-3.pdf'
  },
  {
    id: '4',
    professor: 'Dr. Sarah Johnson',
    university: 'University of Sydney',
    country: 'Australia',
    scholarship: 'Research Fellowship',
    status: 'Rejected',
    emailScreenshot: '/sample-screenshot-4.png',
    proposalPdf: '/sample-proposal-4.pdf'
  }
];

export default function Home() {
  const [emails, setEmails] = useState(initialEmails);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState<typeof emails[0] | null>(null);

  const filters = [
    { id: 'all', label: 'All Emails' },
    { id: 'pending', label: 'Pending' },
    { id: 'replied', label: 'Replied' },
    { id: 'rejected', label: 'Rejected' }
  ];

  // Filter emails based on search term and active filter
  const filteredEmails = emails.filter(email => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      email.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.scholarship.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = activeFilter === 'all' || 
      (activeFilter === 'pending' && email.status === 'Pending') ||
      (activeFilter === 'replied' && email.status === 'Replied') ||
      (activeFilter === 'rejected' && email.status === 'Rejected');
    
    return matchesSearch && matchesStatus;
  });

  const handleEditEmail = (email: typeof emails[0]) => {
    setCurrentEmail(email);
    // In a real app, this would open an edit modal
    alert(`Edit email for ${email.professor} - This would open an edit modal in a real app`);
  };

  const handleDeleteEmail = (emailId: string) => {
    setConfirmDeleteId(emailId);
  };

  const confirmDeleteEmail = () => {
    if (confirmDeleteId) {
      setEmails(emails.filter(email => email.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  const handleAddNewEmail = () => {
    // In a real app, this would open a new email modal
    alert('Add new email - This would open a new email modal in a real app');
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

      {/* Email Tracking Table */}
      <section>
        <EmailList 
          emails={filteredEmails} 
          onEdit={handleEditEmail}
          onDelete={handleDeleteEmail}
        />
      </section>

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
    </div>
  );
}