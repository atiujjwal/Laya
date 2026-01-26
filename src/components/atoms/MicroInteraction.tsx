'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface MicroInteractionProps {
  children: React.ReactNode;
  trigger?: 'hover' | 'click' | 'focus';
  className?: string;
  hiddenByDefault?: boolean;
}

/**
 * Micro-Interactions: UI elements hidden by default to reduce visual noise
 * Revealed on interaction (hover, click, or focus)
 */
export const MicroInteraction: React.FC<MicroInteractionProps> = ({
  children,
  trigger = 'hover',
  className,
  hiddenByDefault = true,
}) => {
  const [isVisible, setIsVisible] = useState(!hiddenByDefault);

  const handleInteraction = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    } else if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  const handleLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  return (
    <div
      className={cn(
        'transition-opacity duration-200',
        hiddenByDefault && !isVisible && 'opacity-0 pointer-events-none',
        !hiddenByDefault || isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      onMouseEnter={trigger === 'hover' ? handleInteraction : undefined}
      onMouseLeave={trigger === 'hover' ? handleLeave : undefined}
      onClick={trigger === 'click' ? handleInteraction : undefined}
      onFocus={trigger === 'focus' ? handleInteraction : undefined}
      onBlur={trigger === 'focus' ? handleLeave : undefined}
    >
      {children}
    </div>
  );
};

/**
 * Edit Icon Button - Hidden by default, shown on hover
 */
export const EditButton: React.FC<{
  onClick: () => void;
  className?: string;
}> = ({ onClick, className }) => {
  return (
    <MicroInteraction trigger="hover" hiddenByDefault>
      <button
        onClick={onClick}
        className={cn(
          'p-1.5 rounded-md hover:bg-accent transition-colors',
          className
        )}
        aria-label="Edit"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>
    </MicroInteraction>
  );
};

/**
 * Delete Icon Button - Hidden by default, shown on hover
 */
export const DeleteButton: React.FC<{
  onClick: () => void;
  className?: string;
}> = ({ onClick, className }) => {
  return (
    <MicroInteraction trigger="hover" hiddenByDefault>
      <button
        onClick={onClick}
        className={cn(
          'p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors',
          className
        )}
        aria-label="Delete"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </MicroInteraction>
  );
};
