//src/components/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface HeaderProps {
  // Optional props for customization if needed
  logoText?: string;
}

const Header: React.FC<HeaderProps> = ({ logoText = 'ScholarSync' }) => {
  const navItems = [
    { label: 'Professors', href: '/professors' },
    { label: 'Countries', href: '/countries' },
    { label: 'Scholarships', href: '/scholarships' },
    { label: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <header className="flex justify-between items-center mb-16 px-6 py-10">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link 
          href="/" 
          className="text-3xl font-bold tracking-tight text-neutral-800 hover:text-neutral-900 transition-colors"
        >
          {logoText}
        </Link>
      </motion.div>
      
      <nav className="flex items-center space-x-8">
        {navItems.map((item) => (
          <motion.div key={item.label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={item.href}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors duration-300"
            >
              {item.label}
            </Link>
          </motion.div>
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
  );
};

export default Header;