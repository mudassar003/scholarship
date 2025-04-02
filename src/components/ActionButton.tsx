// src/components/ActionButton.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'danger' | 'success' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  disabled = false,
}) => {
  // Map variant to colors
  const variantStyles = {
    primary: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200',
    success: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    neutral: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
  };

  // Map size to dimensions
  const sizeStyles = {
    sm: 'p-1.5 rounded-md',
    md: 'p-2 rounded-lg',
    lg: 'p-3 rounded-lg'
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20
  };

  // Handle disabled state
  const disabledClass = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'transition-colors duration-200';

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={disabled ? undefined : onClick}
      className={`${variantStyles[variant]} ${sizeStyles[size]} ${disabledClass} flex items-center gap-2`}
      title={label}
      disabled={disabled}
    >
      <Icon size={iconSizes[size]} />
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </motion.button>
  );
};

export default ActionButton;