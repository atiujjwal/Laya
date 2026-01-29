'use client';

import { useState, useRef, useEffect } from 'react';
import { Habit } from '@/types/habit';
import { HabitRow } from './HabitRow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const getDaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

interface HabitGridProps {
  habits?: Habit[];
  onToggleHabit?: (id: string, date: Date) => void;
}

export function HabitGrid({ habits = [], onToggleHabit }: HabitGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const todayRef = useRef<HTMLDivElement>(null);

  const days = getDaysInMonth(
    currentDate.getFullYear(),
    currentDate.getMonth(),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (todayRef.current) {
        todayRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentDate]);

  return (
    <Card className="border-border shadow-sm bg-white flex flex-col h-full">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-white flex-shrink-0 rounded-t-xl">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-5 w-5" />
          <span className="font-medium text-foreground">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="overflow-auto custom-scrollbar h-[800px] relative">
        <div className="min-w-[800px]">

          {/* --- STICKY HEADER ROW --- */}
          <div className="flex border-b bg-neutral-50/95 backdrop-blur sticky top-0 z-30 shadow-sm">

            {/* Sticky Left: Habit Title */}
            <div className="w-48 flex-shrink-0 px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider sticky left-0 bg-neutral-50 z-40 border-r">
              Habit
            </div>

            {/* Scrollable Middle: Days */}
            <div className="flex-1 flex">
              {days.map((d, i) => {
                const todayObj = new Date();
                const isTodayHeader = d.getDate() === todayObj.getDate() &&
                  d.getMonth() === todayObj.getMonth() &&
                  d.getFullYear() === todayObj.getFullYear();
                return (
                  <div
                    key={i}
                    ref={isTodayHeader ? todayRef : null}
                    className={`flex-1 min-w-[2.5rem] text-center py-2 border-r border-neutral-200/50 last:border-0 ${!isTodayHeader ? 'opacity-50' : ''}`}
                  >
                    <div className="text-[10px] text-muted-foreground font-semibold">
                      {d.toLocaleDateString('en-US', { weekday: 'narrow' })}
                    </div>
                    <div className={`text-sm ${isTodayHeader ? 'text-primary font-bold' : 'text-foreground'}`}>
                      {d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky Right: Progress */}
            <div className="w-32 flex-shrink-0 text-center py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider sticky right-0 bg-neutral-50 z-40 border-l">
              Progress
            </div>
          </div>

          {/* --- DATA ROWS --- */}
          <div className="divide-y divide-neutral-100">
            {habits.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                daysInMonth={days}
                className="h-10"
                onToggle={(id, date) => onToggleHabit?.(id, date)}
              />
            ))}
            {habits.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No habits found. Create one to get started!
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
