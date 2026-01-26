'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className,
  lines = 3,
}) => {
  return (
    <div className={cn('space-y-3 p-4', className)}>
      <Skeleton className="h-4 w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </div>
  );
};

export const SkeletonTimeline: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonChart: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div className={cn('space-y-4 p-4', className)}>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-[200px] w-full" />
    </div>
  );
};

export const SkeletonGrid: React.FC<{
  rows?: number;
  cols?: number;
  className?: string;
}> = ({ rows = 3, cols = 4, className }) => {
  return (
    <div className={cn('grid gap-4', className)} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: rows * cols }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
};
