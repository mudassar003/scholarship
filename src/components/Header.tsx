//src/components/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Home, Settings } from 'lucide-react';

interface HeaderProps {
  // Optional props for customization if needed
  logoText?: string;
}

const Header: React.FC<HeaderProps> = ({ logoText = 'ScholarSync' }) => {
  const router = useRouter();
  const pathname = usePathname();
  
  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Professors', href: '/professors', icon: null },
    { label: 'Countries', href: '/countries', icon: null },
    { label: 'Scholarships', href: '/scholarships', icon: null },
    { label: 'Dashboard', href: '/dashboard', icon: null },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleNewEmail = () => {
    router.push('/professors?new=true');
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname && pathname.startsWith(path)) return true;
    return false;
  };

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
      
      <nav className="flex items-center space-x-6">
        {navItems.map((item) => (
          <motion.div key={item.label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={item.href}
              className={`text-sm font-medium flex items-center gap-1.5 transition-colors duration-300 ${
                isActive(item.href) 
                  ? 'text-indigo-600' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {item.icon && <item.icon size={16} />}
              {item.label}
            </Link>
          </motion.div>
        ))}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNewEmail}
          className="bg-neutral-800 text-white hover:bg-neutral-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={16} />
          New Email
        </motion.button>
      </nav>
    </header>
  );
};

export default Header;