'use client';

import { useState } from 'react';
import { Habit } from '@/types/habit';
import { cn } from '@/lib/utils';
import { GridCell } from '@/components/atoms/GridCell';
import { HabitInfo } from '@/components/molecules/HabitInfo';
import { HabitContextMenu } from '@/components/molecules/HabitContextMenu';
import { LogNoteDialog } from '@/components/organisms/LogNoteDialog';

interface HabitRowProps {
  habit: Habit;
  daysInMonth: Date[];
  onToggle: (habitId: string, date: Date) => void;
}

export function HabitRow({ habit, daysInMonth, onToggle }: HabitRowProps) {
  // State for the Note Dialog
  const [noteDate, setNoteDate] = useState<Date | null>(null);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  // Helper to check if a specific date is completed
  const getStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return habit.logs.find((log) => log.date === dateStr)?.status;
  };

  // Stats Logic
  const completedCount = habit.logs.filter(
    (l) => l.status === 'completed',
  ).length;
  const progressPercent =
    habit.goalCount > 0
      ? Math.round((completedCount / habit.goalCount) * 100)
      : 0;

  // Handler to open the note dialog from the Context Menu
  const handleOpenNote = (date: Date) => {
    setNoteDate(date);
    setIsNoteOpen(true);
  };

  // Placeholder handler for "Mark Failed" (Future implementation)
  const handleMarkFailed = (date: Date) => {
    console.log(`Marking ${habit.title} as failed on ${date.toDateString()}`);
    // In a real app, you would call a prop function here like onStatusChange(id, date, 'failed')
  };

  return (
    <>
      <div className="group flex items-stretch border-b last:border-0 hover:bg-neutral-50/50 transition-colors">
        {/* Molecule: Sticky Left Info */}
        <HabitInfo
          title={habit.title}
          category={habit.category}
          className="group-hover:bg-neutral-50"
        />

        {/* Atoms: The Grid Cells wrapped in Context Menu */}
        <div className="flex-1 flex">
          {daysInMonth.map((date, index) => (
            <HabitContextMenu
              key={index}
              onMarkComplete={() => onToggle(habit.id, date)}
              onMarkFailed={() => handleMarkFailed(date)}
              onAddNote={() => handleOpenNote(date)}
            >
              <GridCell
                date={date}
                isToday={new Date().toDateString() === date.toDateString()}
                status={getStatus(date)}
                onClick={() => onToggle(habit.id, date)}
              />
            </HabitContextMenu>
          ))}
        </div>

        {/* Molecule: Right Stats */}
        <div className="w-32 flex flex-col justify-center px-4 border-l bg-white group-hover:bg-neutral-50 transition-colors">
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold text-foreground">
              {progressPercent}%
            </span>
            <span className="text-[10px] text-muted-foreground">
              {completedCount}/{habit.goalCount}
            </span>
          </div>
          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500 ease-out',
                progressPercent >= 100
                  ? 'bg-laya-success'
                  : 'bg-gradient-to-r from-primary to-orange-400',
              )}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Global Dialog for this row (Rendered conditionally based on state) */}
      <LogNoteDialog
        open={isNoteOpen}
        onOpenChange={setIsNoteOpen}
        date={noteDate}
        habitTitle={habit.title}
      />
    </>
  );
}
