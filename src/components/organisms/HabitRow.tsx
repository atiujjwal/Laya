'use client';

import { Habit } from '@/types/habit';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { format } from 'date-fns';

interface HabitRowProps {
  habit: Habit;
  daysInMonth: Date[];
  className?: string;
  onToggle: (habitId: string, date: Date) => void;
}

export function HabitRow({ habit, daysInMonth, className, onToggle }: HabitRowProps) {

  // Calculate completion % for this month view
  const completions = daysInMonth.reduce((acc, day) => {
    const isCompleted = habit.logs?.some((log: any) => {
      const logDate = new Date(log.date);
      return (
        logDate.getUTCFullYear() === day.getFullYear() &&
        logDate.getUTCMonth() === day.getMonth() &&
        logDate.getUTCDate() === day.getDate() &&
        (log.completed === true || log.status === 'COMPLETED')
      );
    });
    return acc + (isCompleted ? 1 : 0);
  }, 0);

  const progress = Math.round((completions / daysInMonth.length) * 100) || 0;

  return (
    <div className={cn("flex group hover:bg-neutral-50/50 transition-colors", className)}>

      {/* 1. Sticky Left: Title */}
      <div className="w-48 flex-shrink-0 px-4 py-2 flex items-center gap-2 border-r bg-white group-hover:bg-neutral-50/50 sticky left-0 z-10 transition-colors">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: habit.color || '#000' }}
        />
        <span className="text-sm font-medium truncate text-foreground" title={habit.title}>
          {habit.title}
        </span>
      </div>

      {/* 2. Scrollable Middle: Checkboxes */}
      <div className="flex-1 flex">
        {daysInMonth.map((day, i) => {
          // Check Status
          const isCompleted = habit.logs?.some((log: any) => {
            const logDate = new Date(log.date);
            // Compare strictly by date parts
            return (
              logDate.getUTCFullYear() === day.getFullYear() &&
              logDate.getUTCMonth() === day.getMonth() &&
              logDate.getUTCDate() === day.getDate() &&
              (log.completed === true || log.status === 'COMPLETED')
            );
          });

          // Check if Today
          const today = new Date();
          const isToday =
            day.getDate() === today.getDate() &&
            day.getMonth() === today.getMonth() &&
            day.getFullYear() === today.getFullYear();

          return (
            <div
              key={i}
              className={cn(
                "flex-1 min-w-[2.5rem] flex items-center justify-center border-r border-neutral-100 last:border-0",
                isToday && "bg-primary/5"
              )}
            >
              <button
                onClick={() => onToggle(habit.id, day)}
                disabled={!isToday} // Disable past/future days if required
                className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center transition-all",
                  isCompleted
                    ? "bg-primary text-primary-foreground shadow-sm scale-100"
                    : "bg-transparent text-transparent hover:bg-neutral-200/50 scale-90",
                  !isToday && !isCompleted && "cursor-default opacity-50 hover:bg-transparent",
                  isToday && !isCompleted && "ring-2 ring-primary/20 bg-white"
                )}
              >
                <Check className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. Sticky Right: Progress */}
      <div className="w-32 flex-shrink-0 flex items-center justify-center gap-2 border-l bg-white group-hover:bg-neutral-50/50 sticky right-0 z-10 transition-colors px-2">
        <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden max-w-[60px]">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-medium w-8 text-right">{progress}%</span>
      </div>
    </div>
  );
}
