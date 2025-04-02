// src/app/professors/page.tsx
'use client';

import React, { useState } from 'react';
import { Professor, Country, Scholarship } from '@/types';
import ProfessorForm from './components/ProfessorForm';
import ProfessorList from './components/ProfessorList';

// Dummy data for countries and scholarships
const DUMMY_COUNTRIES: Country[] = [
  { id: '1', name: 'United States', code: 'US' },
  { id: '2', name: 'United Kingdom', code: 'UK' },
  { id: '3', name: 'Canada', code: 'CA' },
  { id: '4', name: 'Australia', code: 'AU' }
];

const DUMMY_SCHOLARSHIPS: Scholarship[] = [
  { id: '1', name: 'Research Grant 2024', country: 'United States' },
  { id: '2', name: 'Postdoctoral Fellowship', country: 'United Kingdom' },
  { id: '3', name: 'Graduate Research Scholarship', country: 'Canada' }
];

// Dummy initial professors
const DUMMY_PROFESSORS: Professor[] = [
  {
    id: '1',
    name: 'Dr. John Smith',
    email: 'john.smith@university.edu',
    country: 'United States',
    scholarship: 'Research Grant 2024',
    emailScreenshot: '/dummy-screenshot.png',
    proposalPdf: '/dummy-proposal.pdf'
  },
  {
    id: '2',
    name: 'Dr. Emma Watson',
    email: 'emma.watson@oxford.ac.uk',
    country: 'United Kingdom',
    scholarship: 'Postdoctoral Fellowship',
    emailScreenshot: '/dummy-screenshot-2.png',
    proposalPdf: '/dummy-proposal-2.pdf'
  }
];

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>(DUMMY_PROFESSORS);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);

  const handleAddProfessor = (newProfessor: Professor) => {
    if (editingProfessor) {
      // Update existing professor
      setProfessors(prev => 
        prev.map(prof => 
          prof.id === editingProfessor.id 
            ? { ...newProfessor, id: editingProfessor.id } 
            : prof
        )
      );
      setEditingProfessor(null);
    } else {
      // Add new professor
      const professorWithId = {
        ...newProfessor,
        id: `${professors.length + 1}`
      };
      setProfessors(prev => [...prev, professorWithId]);
    }
  };

  const handleEditProfessor = (professor: Professor) => {
    setEditingProfessor(professor);
  };

  const handleDeleteProfessor = (professorId: string) => {
    setProfessors(prev => prev.filter(prof => prof.id !== professorId));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-900">
          Professors Management
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Professor Form Column */}
          <div className="lg:col-span-1">
            <ProfessorForm 
              countries={DUMMY_COUNTRIES}
              scholarships={DUMMY_SCHOLARSHIPS}
              onSubmit={handleAddProfessor}
              initialProfessor={editingProfessor}
              onCancel={() => setEditingProfessor(null)}
            />
          </div>

          {/* Professor List Column */}
          <div className="lg:col-span-2">
            <ProfessorList 
              professors={professors}
              onEdit={handleEditProfessor}
              onDelete={handleDeleteProfessor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}