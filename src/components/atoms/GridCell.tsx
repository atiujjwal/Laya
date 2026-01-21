'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GridCellProps {
  date: Date;
  status?: 'completed' | 'skipped' | 'failed';
  isToday: boolean;
  onClick: () => void;
}

export function GridCell({ date, status, isToday, onClick }: GridCellProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'h-12 flex-1 min-w-[2.5rem] border-r border-dashed border-neutral-200 flex items-center justify-center transition-all duration-200',
              // State: Completed (Green)
              status === 'completed'
                ? 'bg-laya-success text-white shadow-inner'
                : 'bg-white hover:bg-neutral-100',
              // State: Today (Highlight)
              isToday &&
                !status &&
                'ring-2 ring-inset ring-primary/50 bg-primary/5',
            )}
            aria-label={`Mark ${date.toLocaleDateString()} as ${status ? 'incomplete' : 'complete'}`}
          >
            {status === 'completed' && (
              <Check className="h-4 w-4 animate-in zoom-in duration-200" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="font-medium">
            {date.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {status ? 'Completed' : 'Click to mark done'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
