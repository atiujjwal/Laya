'use client';

import React, { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface HabitMatrixData {
  habitId: string;
  habitTitle: string;
  habitColor?: string;
  completions: Date[]; // Dates when habit was completed
}

interface HabitMatrixProps {
  habits: HabitMatrixData[];
  viewMode: '7day' | '30day';
  startDate?: Date;
  onCellClick?: (habitId: string, date: Date) => void;
}

export const HabitMatrix: React.FC<HabitMatrixProps> = ({
  habits,
  viewMode,
  startDate = new Date(),
  onCellClick,
}) => {
  // Calculate date range
  const dateRange = useMemo(() => {
    if (viewMode === '7day') {
      const weekStart = startOfWeek(startDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(startDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else {
      // 30-day view
      const end = new Date(startDate);
      const start = new Date(end);
      start.setDate(start.getDate() - 29); // 30 days including today
      return eachDayOfInterval({ start, end });
    }
  }, [viewMode, startDate]);

  // Create completion map for quick lookup
  const completionMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    
    habits.forEach((habit) => {
      const dateSet = new Set<string>();
      habit.completions.forEach((date) => {
        dateSet.add(format(date, 'yyyy-MM-dd'));
      });
      map.set(habit.habitId, dateSet);
    });

    return map;
  }, [habits]);

  // Check if habit was completed on a specific date
  const isCompleted = (habitId: string, date: Date): boolean => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return completionMap.get(habitId)?.has(dateKey) || false;
  };

  // Get completion rate for a habit
  const getCompletionRate = (habitId: string): number => {
    const completions = completionMap.get(habitId);
    if (!completions) return 0;
    return (completions.size / dateRange.length) * 100;
  };

  return (
    <div className="w-full bg-card border rounded-xl p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold">Habit Matrix</h2>
          <p className="text-sm text-muted-foreground">
            {viewMode === '7day' ? '7-Day View' : '30-Day View'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted border" />
            <span>Not Completed</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left text-xs font-semibold text-muted-foreground p-2 sticky left-0 bg-card z-10">
                  Habit
                </th>
                {dateRange.map((date) => (
                  <th
                    key={format(date, 'yyyy-MM-dd')}
                    className="text-center text-xs font-semibold text-muted-foreground p-2 min-w-[40px]"
                  >
                    {/* Two-letter day name, e.g. Mo, Tu, We */}
                    {format(date, 'EEE').slice(0, 2)}
                    <br />
                    <span className="text-[10px]">{format(date, 'd')}</span>
                  </th>
                ))}
                <th className="text-center text-xs font-semibold text-muted-foreground p-2">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody>
              <TooltipProvider>
                {habits.map((habit) => {
                  const completionRate = getCompletionRate(habit.habitId);
                  const isToday = (date: Date) => isSameDay(date, new Date());

                  return (
                    <tr key={habit.habitId} className="border-t hover:bg-muted/20">
                      <td className="p-2 sticky left-0 bg-card z-10">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: habit.habitColor || 'hsl(var(--primary))',
                            }}
                          />
                          <span className="text-sm font-medium truncate max-w-[150px] sm:max-w-[220px]">
                            {habit.habitTitle}
                          </span>
                        </div>
                      </td>
                      {dateRange.map((date) => {
                        const completed = isCompleted(habit.habitId, date);
                        const today = isToday(date);

                          return (
                            <td
                              key={format(date, 'yyyy-MM-dd')}
                              className="p-1 sm:p-2 text-center align-middle"
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className={cn(
                                      'w-6 h-6 sm:w-7 sm:h-7 mx-auto rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                                      completed
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted border border-border',
                                      today && 'ring-2 ring-primary ring-offset-1'
                                    )}
                                    onClick={() => onCellClick?.(habit.habitId, date)}
                                  >
                                    {completed && (
                                      <span className="text-[10px] font-semibold">✓</span>
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <div className="text-xs">
                                    <p className="font-semibold">{habit.habitTitle}</p>
                                    <p className="text-muted-foreground">
                                      {format(date, 'MMM d, yyyy')}
                                    </p>
                                    <p className="text-muted-foreground">
                                      {completed ? 'Completed' : 'Not completed'}
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </td>
                          );
                      })}
                      <td className="p-2 text-center whitespace-nowrap">
                        <span className="text-sm font-semibold">
                          {Math.round(completionRate)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </TooltipProvider>
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between pt-4 border-t text-sm">
        <div className="text-muted-foreground">
          <span className="font-semibold text-foreground">{habits.length}</span> habits tracked
        </div>
        <div className="text-muted-foreground">
          Average completion rate:{' '}
          <span className="font-semibold text-foreground">
            {Math.round(
              habits.reduce((sum, h) => sum + getCompletionRate(h.habitId), 0) / habits.length || 0
            )}
            %
          </span>
        </div>
      </div>
    </div>
  );
};
