// src/app/professors/components/ProfessorList.tsx
'use client';

import React, { useState } from 'react';
import { Professor } from '@/types';

interface ProfessorListProps {
  professors: Professor[];
  onEdit: (professor: Professor) => void;
  onDelete: (professorId: string) => void;
}

const ProfessorList: React.FC<ProfessorListProps> = ({ 
  professors, 
  onEdit, 
  onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [professorsPerPage] = useState(5);

  // Filter professors based on search term
  const filteredProfessors = professors.filter(professor => 
    professor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professor.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastProfessor = currentPage * professorsPerPage;
  const indexOfFirstProfessor = indexOfLastProfessor - professorsPerPage;
  const currentProfessors = filteredProfessors.slice(
    indexOfFirstProfessor, 
    indexOfLastProfessor
  );

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Confirmation modal for delete
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  const handleDeleteClick = (professorId: string) => {
    setDeleteConfirmation(professorId);
  };

  const confirmDelete = () => {
    if (deleteConfirmation) {
      onDelete(deleteConfirmation);
      setDeleteConfirmation(null);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Search Input */}
      <div className="p-4 bg-gray-50 border-b">
        <input 
          type="text"
          placeholder="Search professors..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Professors Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Country</th>
            <th className="p-3">Scholarship</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentProfessors.map((professor) => (
            <tr 
              key={professor.id} 
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="p-3">{professor.name}</td>
              <td className="p-3">{professor.email}</td>
              <td className="p-3">{professor.country}</td>
              <td className="p-3">
                {professor.scholarship || 'N/A'}
              </td>
              <td className="p-3 flex justify-center space-x-2">
                {/* Edit Button */}
                <button
                  onClick={() => onEdit(professor)}
                  className="text-blue-600 hover:text-blue-800 transition"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteClick(professor.id!)}
                  className="text-red-600 hover:text-red-800 transition"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="p-4 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing{' '}
          <span className="font-medium">
            {indexOfFirstProfessor + 1}
          </span>{' '}
          to{' '}
          <span className="font-medium">
            {Math.min(indexOfLastProfessor, filteredProfessors.length)}
          </span>{' '}
          of{' '}
          <span className="font-medium">
            {filteredProfessors.length}
          </span>{' '}
          professors
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastProfessor >= filteredProfessors.length}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this professor?</p>
            <div className="flex space-x-4">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessorList;