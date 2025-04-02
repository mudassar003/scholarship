// src/app/professors/components/ProfessorForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Professor, Country, Scholarship } from '@/types';

interface ProfessorFormProps {
  countries: Country[];
  scholarships: Scholarship[];
  onSubmit: (professor: Professor) => void;
  initialProfessor?: Professor | null;
  onCancel?: () => void;
}

const ProfessorForm: React.FC<ProfessorFormProps> = ({
  countries,
  scholarships,
  onSubmit,
  initialProfessor = null,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [scholarship, setScholarship] = useState('');
  const [emailScreenshot, setEmailScreenshot] = useState<File | null>(null);
  const [proposalPdf, setProposalPdf] = useState<File | null>(null);
  const [newCountry, setNewCountry] = useState('');
  const [newScholarship, setNewScholarship] = useState('');

  useEffect(() => {
    if (initialProfessor) {
      setName(initialProfessor.name);
      setEmail(initialProfessor.email);
      setCountry(initialProfessor.country);
      setScholarship(initialProfessor.scholarship || '');
    } else {
      // Reset form when not editing
      setName('');
      setEmail('');
      setCountry('');
      setScholarship('');
      setEmailScreenshot(null);
      setProposalPdf(null);
    }
  }, [initialProfessor]);

  const handleFileChange = (
    setter: React.Dispatch<React.SetStateAction<File | null>>, 
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setter(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!name || !email || !country) {
      alert('Please fill in all required fields');
      return;
    }

    // Prepare professor object
    const professorData: Professor = {
      name,
      email,
      country,
      scholarship: scholarship || undefined,
      // For now, we'll store file paths as placeholders
      emailScreenshot: emailScreenshot 
        ? `/uploads/screenshots/${emailScreenshot.name}` 
        : undefined,
      proposalPdf: proposalPdf 
        ? `/uploads/proposals/${proposalPdf.name}` 
        : undefined
    };

    // Submit the professor data
    onSubmit(professorData);

    // Reset form
    setName('');
    setEmail('');
    setCountry('');
    setScholarship('');
    setEmailScreenshot(null);
    setProposalPdf(null);
  };

  const handleAddNewCountry = () => {
    if (newCountry.trim()) {
      // In a real app, this would be an API call
      countries.push({
        id: `${countries.length + 1}`,
        name: newCountry.trim(),
        code: newCountry.trim().substring(0, 2).toUpperCase()
      });
      setCountry(newCountry.trim());
      setNewCountry('');
    }
  };

  const handleAddNewScholarship = () => {
    if (newScholarship.trim() && country) {
      // In a real app, this would be an API call
      scholarships.push({
        id: `${scholarships.length + 1}`,
        name: newScholarship.trim(),
        country
      });
      setScholarship(newScholarship.trim());
      setNewScholarship('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white shadow-md rounded-lg p-6 space-y-4"
    >
      <h2 className="text-2xl font-semibold mb-4 text-blue-900">
        {initialProfessor ? 'Edit Professor' : 'Add New Professor'}
      </h2>

      {/* Name Input */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Professor Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
          placeholder="Enter professor's full name"
        />
      </div>

      {/* Remaining form content (from previous artifact) stays the same */}

      {/* Submit and Cancel Buttons */}
      <div className="flex space-x-4">
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
        >
          {initialProfessor ? 'Update Professor' : 'Add Professor'}
        </button>
        
        {initialProfessor && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ProfessorForm;