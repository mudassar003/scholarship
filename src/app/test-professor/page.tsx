'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestProfessorPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState('Pending');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [result, setResult] = useState<{ success?: boolean; message?: string; data?: any }>({});

  // Fetch countries from the database on component load
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const { data, error } = await supabase
          .from('countries')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) {
          console.error('Error fetching countries:', error);
        } else {
          setCountries(data || []);
        }
      } catch (error) {
        console.error('Unexpected error fetching countries:', error);
      }
    };
    
    fetchCountries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult({});

    try {
      // Create a more complete professor object
      const professorData: any = {
        name,
        email
      };
      
      // Only add fields that have values
      if (university) professorData.university_name = university;
      if (department) professorData.department = department;
      if (country) professorData.country = country;
      if (status) professorData.status = status;
      if (notes) professorData.notes = notes;

      console.log('Submitting professor data:', professorData);

      // Insert directly using Supabase client
      const { data, error } = await supabase
        .from('professors')
        .insert(professorData)
        .select();

      if (error) {
        console.error('Error creating professor:', error);
        setResult({
          success: false,
          message: `Error: ${error.message}`,
          data: error
        });
      } else {
        console.log('Professor created successfully:', data);
        setResult({
          success: true,
          message: 'Professor created successfully!',
          data
        });
        // Clear the form
        setName('');
        setEmail('');
        setUniversity('');
        setDepartment('');
        setCountry('');
        setStatus('Pending');
        setNotes('');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setResult({
        success: false,
        message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
        data: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Enhanced Professor Test</h1>
      
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Professor Name*
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address*
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* University */}
            <div>
              <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
                University
              </label>
              <input
                type="text"
                id="university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.name}>
                    {country.name} {country.flag && `${country.flag}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Pending">Pending</option>
                <option value="Replied">Replied</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-2 px-4 font-medium text-white ${
              loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Creating...' : 'Create Professor'}
          </button>
        </form>
      </div>
      
      {/* Result display */}
      {result.message && (
        <div 
          className={`p-4 rounded-lg ${
            result.success 
              ? 'bg-green-100 border border-green-300 text-green-800' 
              : 'bg-red-100 border border-red-300 text-red-800'
          }`}
        >
          <p className="font-medium">{result.message}</p>
          
          {/* Display the created/error data */}
          {result.data && (
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto text-xs">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}