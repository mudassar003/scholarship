// src/components/ActionButtonsGroup.tsx
'use client';

import React from 'react';
import ActionButton from './ActionButton';
import { Edit2, Trash2, Eye, FileText, Mail } from 'lucide-react';

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

  return (
    <div className={containerClass}>
      {onEdit && (
        <ActionButton
          icon={Edit2}
          label="Edit"
          onClick={onEdit}
          variant="primary"
          size={size}
        />
      )}
      
      {onDelete && (
        <ActionButton
          icon={Trash2}
          label="Delete"
          onClick={onDelete}
          variant="danger"
          size={size}
        />
      )}

      {onViewEmail && (
        <ActionButton
          icon={Mail}
          label="View Email"
          onClick={onViewEmail}
          variant="neutral"
          size={size}
        />
      )}

      {onViewProposal && (
        <ActionButton
          icon={FileText}
          label="View Proposal"
          onClick={onViewProposal}
          variant="success"
          size={size}
        />
      )}
    </div>
  );
};

export default ActionButtonsGroup;