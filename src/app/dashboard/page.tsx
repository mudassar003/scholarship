//src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Professor, Scholarship, University, Country } from '@/types';
import { Users, GraduationCap, Building, Globe, Mail, Clock, Calendar } from 'lucide-react';
import { getProfessors } from '@/services/professorService';
import { getScholarships } from '@/services/scholarshipService';
import { getUniversities } from '@/services/universityService';
import { getCountries } from '@/services/countryService';

interface StatsCard {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  link: string;
}

export default function DashboardPage() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const [professorsData, scholarshipsData, universitiesData, countriesData] = await Promise.all([
          getProfessors(),
          getScholarships(),
          getUniversities(),
          getCountries()
        ]);
        
        setProfessors(professorsData);
        setScholarships(scholarshipsData);
        setUniversities(universitiesData);
        setCountries(countriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate stats
  const pendingProfessors = professors.filter(p => p.status === 'Pending').length;
  const repliedProfessors = professors.filter(p => p.status === 'Replied').length;
  const upcomingScholarships = scholarships.filter(s => {
    if (!s.deadline) return false;
    const deadline = new Date(s.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadline >= today;
  }).length;

  // Stats cards data
  const statsCards: StatsCard[] = [
    {
      title: 'Total Professors',
      value: professors.length,
      icon: Users,
      color: 'bg-indigo-500',
      link: '/professors'
    },
    {
      title: 'Total Scholarships',
      value: scholarships.length,
      icon: GraduationCap,
      color: 'bg-emerald-500',
      link: '/scholarships'
    },
    {
      title: 'Universities',
      value: universities.length,
      icon: Building,
      color: 'bg-amber-500',
      link: '/universities'
    },
    {
      title: 'Countries',
      value: countries.length,
      icon: Globe,
      color: 'bg-rose-500',
      link: '/countries'
    }
  ];

  // Sub stats
  const subStats = [
    {
      title: 'Pending Emails',
      value: pendingProfessors,
      icon: Mail,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      title: 'Replied Professors',
      value: repliedProfessors,
      icon: Clock,
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Upcoming Deadlines',
      value: upcomingScholarships,
      icon: Calendar,
      color: 'bg-indigo-100 text-indigo-800'
    }
  ];

  // Recent deadlines for scholarships (next 30 days)
  const upcomingDeadlines = scholarships
    .filter(s => {
      if (!s.deadline) return false;
      const deadline = new Date(s.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      return deadline >= today && deadline <= thirtyDaysFromNow;
    })
    .sort((a, b) => {
      if (!a.deadline || !b.deadline) return 0;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    })
    .slice(0, 5);

  // Recent professors added (top 5)
  const recentProfessors = [...professors]
    .sort((a, b) => {
      if (!a.created_at || !b.created_at) return 0;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 5);

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold text-neutral-800 mb-8">Dashboard</h1>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link href={stat.link}>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow flex items-start justify-between">
                    <div>
                      <p className="text-neutral-500 text-sm font-medium mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-neutral-800">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg text-white`}>
                      <stat.icon size={24} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Sub Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {subStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
                className="bg-white p-5 rounded-xl shadow-sm border border-neutral-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <stat.icon size={20} />
                  </div>
                  <div>
                    <p className="text-neutral-500 text-sm">{stat.title}</p>
                    <p className="text-xl font-semibold text-neutral-800">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Two Column Layout for Recent Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Deadlines */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden"
            >
              <div className="p-5 border-b border-neutral-200">
                <h2 className="text-lg font-semibold text-neutral-800">Upcoming Deadlines</h2>
              </div>
              <div className="divide-y divide-neutral-200">
                {upcomingDeadlines.length === 0 ? (
                  <div className="p-6 text-center text-neutral-500">
                    No upcoming deadlines in the next 30 days
                  </div>
                ) : (
                  upcomingDeadlines.map((scholarship) => (
                    <div key={scholarship.id} className="p-4 hover:bg-neutral-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-neutral-800">{scholarship.name}</h3>
                          <p className="text-sm text-neutral-500">{scholarship.country}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800`}>
                          {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'No deadline'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-neutral-200">
                <Link 
                  href="/scholarships" 
                  className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                >
                  View all scholarships
                </Link>
              </div>
            </motion.div>

            {/* Recent Professors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden"
            >
              <div className="p-5 border-b border-neutral-200">
                <h2 className="text-lg font-semibold text-neutral-800">Recent Professors</h2>
              </div>
              <div className="divide-y divide-neutral-200">
                {recentProfessors.length === 0 ? (
                  <div className="p-6 text-center text-neutral-500">
                    No professors added yet
                  </div>
                ) : (
                  recentProfessors.map((professor) => (
                    <div key={professor.id} className="p-4 hover:bg-neutral-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-neutral-800">{professor.name}</h3>
                          <p className="text-sm text-neutral-500">
                            {professor.university_name || 'No university'}, {professor.country || 'No country'}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs ${
                          professor.status === 'Replied' ? 'bg-green-100 text-green-800' : 
                          professor.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {professor.status || 'Pending'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-neutral-200">
                <Link 
                  href="/professors" 
                  className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                >
                  View all professors
                </Link>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}