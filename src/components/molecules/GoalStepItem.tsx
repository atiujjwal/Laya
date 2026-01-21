'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface GoalStepItemProps {
  id: string;
  text: string;
  isCompleted: boolean;
  onToggle: (id: string) => void;
}

export function GoalStepItem({
  id,
  text,
  isCompleted,
  onToggle,
}: GoalStepItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-2 rounded-md transition-colors',
        isCompleted ? 'bg-neutral-50' : 'hover:bg-neutral-50',
      )}
    >
      <Checkbox
        id={id}
        checked={isCompleted}
        onCheckedChange={() => onToggle(id)}
        className="mt-0.5 data-[state=checked]:bg-laya-success data-[state=checked]:border-laya-success"
      />
      <label
        htmlFor={id}
        className={cn(
          'text-sm leading-none cursor-pointer select-none',
          isCompleted
            ? 'text-muted-foreground line-through'
            : 'text-foreground',
        )}
      >
        {text}
      </label>
    </div>
  );
}
