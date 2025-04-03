//src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Professor, Scholarship, University, Country } from '@/types';
import { 
  Users, GraduationCap, Building, Globe, Mail, Clock, Calendar, 
  AlertTriangle, BarChart2, TrendingUp, Bell, CheckCircle, FileText
} from 'lucide-react';
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

interface SubStat {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

export default function DashboardPage(): React.ReactNode {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [insights, setInsights] = useState<{
    needsFollowUp: number;
    repliedRate: number;
    upcomingDeadlines: number;
    mostActiveCountry: string;
  }>({
    needsFollowUp: 0,
    repliedRate: 0,
    upcomingDeadlines: 0,
    mostActiveCountry: ''
  });

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
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
        
        // Calculate insights
        calculateInsights(professorsData, scholarshipsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const calculateInsights = (profs: Professor[], schols: Scholarship[]): void => {
    // Calculate emails needing follow-up (sent > 7 days ago with no reply)
    const currentDate = new Date();
    const needsFollowUp = profs.filter(prof => {
      const emailDate = prof.email_date ? new Date(prof.email_date) : null;
      if (!emailDate) return false;
      
      const daysSinceEmail = Math.floor((currentDate.getTime() - emailDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceEmail >= 7 && prof.status === 'Pending';
    }).length;
    
    // Calculate reply rate
    const repliedCount = profs.filter(prof => prof.status === 'Replied').length;
    const repliedRate = profs.length > 0 ? Math.round((repliedCount / profs.length) * 100) : 0;
    
    // Calculate upcoming deadlines in the next 30 days
    const upcomingDeadlines = schols.filter(s => {
      if (!s.deadline) return false;
      const deadline = new Date(s.deadline);
      const daysUntilDeadline = Math.floor((deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline >= 0 && daysUntilDeadline <= 30;
    }).length;
    
    // Find most active country
    const countryMap: Record<string, number> = {};
    profs.forEach(prof => {
      if (prof.country) {
        countryMap[prof.country] = (countryMap[prof.country] || 0) + 1;
      }
    });
    
    let mostActiveCountry = '';
    let maxCount = 0;
    
    Object.entries(countryMap).forEach(([country, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostActiveCountry = country;
      }
    });
    
    setInsights({
      needsFollowUp,
      repliedRate,
      upcomingDeadlines,
      mostActiveCountry: mostActiveCountry || 'None'
    });
  };

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
  const subStats: SubStat[] = [
    {
      title: 'Pending Emails',
      value: pendingProfessors,
      icon: Mail,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      title: 'Replied Professors',
      value: repliedProfessors,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Upcoming Deadlines',
      value: upcomingScholarships,
      icon: Calendar,
      color: 'bg-indigo-100 text-indigo-800'
    }
  ];

  // Insight cards
  const insightCards = [
    {
      title: 'Needs Follow-up',
      value: insights.needsFollowUp,
      icon: Bell,
      color: 'from-orange-500 to-red-500',
      description: 'Emails sent over 7 days ago with no reply',
      link: '/notifications'
    },
    {
      title: 'Reply Rate',
      value: `${insights.repliedRate}%`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500',
      description: 'Percentage of emails that received replies',
      link: '/professors'
    },
    {
      title: 'Upcoming Deadlines',
      value: insights.upcomingDeadlines,
      icon: Clock,
      color: 'from-indigo-500 to-blue-500',
      description: 'Scholarship deadlines in the next 30 days',
      link: '/scholarships'
    },
    {
      title: 'Most Active Country',
      value: insights.mostActiveCountry,
      icon: BarChart2,
      color: 'from-violet-500 to-purple-500',
      description: 'Country with the most professors',
      link: '/countries'
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
    <div className="w-full bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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

            {/* Analytics and Insights */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-neutral-800 mb-6">Insights & Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {insightCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  >
                    <Link href={card.link}>
                      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-all overflow-hidden h-full">
                        <div className={`h-2 bg-gradient-to-r ${card.color}`}></div>
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium text-neutral-500 text-sm">{card.title}</h3>
                              <p className="text-2xl font-bold text-neutral-800 mt-1">{card.value}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-neutral-100">
                              <card.icon size={20} className="text-neutral-600" />
                            </div>
                          </div>
                          <p className="text-neutral-500 text-sm">{card.description}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sub Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {subStats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 + 0.8 }}
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
                transition={{ duration: 0.4, delay: 1.1 }}
                className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden"
              >
                <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-neutral-800">Upcoming Deadlines</h2>
                  <Calendar size={18} className="text-neutral-500" />
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
                transition={{ duration: 0.4, delay: 1.2 }}
                className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden"
              >
                <div className="p-5 border-b border-neutral-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-neutral-800">Recent Professors</h2>
                  <Users size={18} className="text-neutral-500" />
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
    </div>
  );
}