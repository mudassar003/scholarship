// src/components/ActionButtonsGroup.tsx
'use client';

import React from 'react';
import ActionButton from './ActionButton';
import { Edit2, Trash2, FileText, Mail } from 'lucide-react';

interface ActionButtonsGroupProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onViewEmail?: () => void;
  onViewProposal?: () => void;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'row' | 'grid';
}

const ActionButtonsGroup: React.FC<ActionButtonsGroupProps> = ({
  onEdit,
  onDelete,
  onViewEmail,
  onViewProposal,
  size = 'md',
  layout = 'row'
}) => {
  const containerClass = layout === 'row' 
    ? 'flex space-x-2' 
    : 'grid grid-cols-2 gap-2';

  // Important: Create no-op functions for undefined handlers to avoid errors
  const handleEdit = onEdit || (() => {});
  const handleDelete = onDelete || (() => {});
  const handleViewEmail = onViewEmail || (() => {});
  const handleViewProposal = onViewProposal || (() => {});

  return (
    <div className={containerClass}>
      {onEdit !== undefined && (
        <ActionButton
          icon={Edit2}
          label="Edit"
          onClick={handleEdit}
          variant="primary"
          size={size}
        />
      )}
      
      {onDelete !== undefined && (
        <ActionButton
          icon={Trash2}
          label="Delete"
          onClick={handleDelete}
          variant="danger"
          size={size}
        />
      )}

      {onViewEmail !== undefined && (
        <ActionButton
          icon={Mail}
          label="View Email"
          onClick={handleViewEmail}
          variant="neutral"
          size={size}
        />
      )}

      {onViewProposal !== undefined && (
        <ActionButton
          icon={FileText}
          label="View Proposal"
          onClick={handleViewProposal}
          variant="success"
          size={size}
        />
      )}
    </div>
  );
};

export default ActionButtonsGroup;