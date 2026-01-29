'use client';

import { useState } from 'react';
import { Habit } from '@/types/habit';
import { HabitRow } from './HabitRow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

// Helper for dates
const getDaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// Placeholder Data
const INITIAL_HABITS: Habit[] = [
  {
    id: '1',
    title: 'Morning Meditation',
    category: 'Health',
    frequency: 'daily',
    goalCount: 30,
    streak: 5,
    logs: [
      { date: '2026-01-20', status: 'completed' },
      { date: '2026-01-21', status: 'completed' },
      { date: '2026-01-22', status: 'completed' },
    ],
  },
  {
    id: '2',
    title: 'Deep Work Session',
    category: 'Work',
    frequency: 'daily',
    goalCount: 20,
    streak: 2,
    logs: [{ date: '2026-01-22', status: 'completed' }],
  },
];

export function HabitGrid() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [habits, setHabits] = useState(INITIAL_HABITS);

  const days = getDaysInMonth(
    currentDate.getFullYear(),
    currentDate.getMonth(),
  );

  const handleToggle = (habitId: string, date: Date) => {
    // --- Date Restrictions ---
    const today = new Date();

    // Check if the clicked date matches Today (Day, Month, Year)
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    // Prevent any changes if it's not today
    if (!isToday) return;

    const dateStr = date.toISOString().split('T')[0];

    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;
        const exists = habit.logs.find((l) => l.date === dateStr);
        let newLogs = exists
          ? habit.logs.filter((l) => l.date !== dateStr) // Logic: Unmark if exists
          : [...habit.logs, { date: dateStr, status: 'completed' as const }]; // Logic: Mark if missing
        return { ...habit, logs: newLogs };
      }),
    );
  };

  return (
    <Card className="border-border shadow-sm overflow-hidden bg-white">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-5 w-5" />
          <span className="font-medium text-foreground">
            {currentDate.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
              )
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() + 1)),
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid Body */}
      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="flex border-b bg-neutral-50/80 backdrop-blur">
            <div className="w-48 flex-shrink-0 px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider sticky left-0 bg-neutral-50 z-20 border-r">
              Habit
            </div>
            <div className="flex-1 flex">
              {days.map((d, i) => {
                const isTodayHeader = d.getDate() === new Date().getDate() &&
                  d.getMonth() === new Date().getMonth();
                return (
                  <div
                    key={i}
                    className={`flex-1 min-w-[2.5rem] text-center py-2 border-r border-neutral-200/50 last:border-0 ${!isTodayHeader ? 'opacity-50' : ''}`}
                  >
                    <div className="text-[10px] text-muted-foreground font-semibold">
                      {d.toLocaleDateString('en-US', { weekday: 'narrow' })}
                    </div>
                    <div
                      className={`text-sm ${isTodayHeader ? 'text-primary font-bold' : 'text-foreground'}`}
                    >
                      {d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="w-32 flex-shrink-0 text-center py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider border-l">
              Progress
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-neutral-100">
            {habits.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                daysInMonth={days}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
