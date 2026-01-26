'use client';

import React, { useMemo } from 'react';
import { format, startOfYear, endOfYear, eachDayOfInterval, isSameDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface ContributionData {
  date: Date;
  count: number; // Number of completed habits/tasks
  level: 0 | 1 | 2 | 3 | 4; // Intensity level (0 = none, 4 = max)
}

interface ContributionGraphProps {
  data: ContributionData[];
  year?: number;
  onDayClick?: (date: Date) => void;
}

const LEVEL_COLORS = {
  0: 'bg-muted',
  1: 'bg-primary/20',
  2: 'bg-primary/40',
  3: 'bg-primary/60',
  4: 'bg-primary',
};

const LEVEL_LABELS = {
  0: 'No activity',
  1: '1-2 activities',
  2: '3-4 activities',
  3: '5-6 activities',
  4: '7+ activities',
};

export const ContributionGraph: React.FC<ContributionGraphProps> = ({
  data,
  year = new Date().getFullYear(),
  onDayClick,
}) => {
  // Generate all days of the year
  const yearDays = useMemo(() => {
    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfYear(new Date(year, 11, 31));
    return eachDayOfInterval({ start, end });
  }, [year]);

  // Create a map for quick lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, ContributionData>();
    data.forEach((item) => {
      const key = format(item.date, 'yyyy-MM-dd');
      map.set(key, item);
    });
    return map;
  }, [data]);

  // Group days by week
  const weeks = useMemo(() => {
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    yearDays.forEach((day, index) => {
      const dayOfWeek = day.getDay();
      
      // Start new week on Sunday or first day
      if (dayOfWeek === 0 || index === 0) {
        if (currentWeek.length > 0) {
          weeks.push(currentWeek);
        }
        currentWeek = [];
      }

      currentWeek.push(day);

      // Last day
      if (index === yearDays.length - 1) {
        weeks.push(currentWeek);
      }
    });

    return weeks;
  }, [yearDays]);

  // Get contribution data for a specific day
  const getDayData = (date: Date): ContributionData => {
    const key = format(date, 'yyyy-MM-dd');
    return dataMap.get(key) || { date, count: 0, level: 0 };
  };

  // Get day of week label
  const getDayLabel = (dayIndex: number): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };

  // Get month labels
  const monthLabels = useMemo(() => {
    const labels: { month: number; weekIndex: number }[] = [];
    const seenMonths = new Set<number>();

    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      const month = firstDay.getMonth();
      if (!seenMonths.has(month)) {
        seenMonths.add(month);
        labels.push({ month, weekIndex });
      }
    });

    return labels;
  }, [weeks]);

  return (
    <div className="w-full bg-card border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold">Activity Overview</h2>
          <p className="text-sm text-muted-foreground">
            {year} contribution graph
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn('w-3 h-3 rounded-sm', LEVEL_COLORS[level as keyof typeof LEVEL_COLORS])}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month Labels */}
          <div className="relative h-4 mb-2">
            {monthLabels.map(({ month, weekIndex }) => (
              <div
                key={month}
                className="absolute text-xs text-muted-foreground"
                style={{ left: `${(weekIndex / weeks.length) * 100}%` }}
              >
                {format(new Date(year, month, 1), 'MMM')}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Day of Week Labels */}
            <div className="flex flex-col gap-1 pr-2">
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <div
                  key={dayIndex}
                  className="text-xs text-muted-foreground h-3 flex items-center"
                  style={{ visibility: dayIndex % 2 === 0 ? 'visible' : 'hidden' }}
                >
                  {getDayLabel(dayIndex)}
                </div>
              ))}
            </div>

            {/* Contribution Grid */}
            <div className="flex gap-1 flex-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                    const day = week[dayIndex];
                    if (!day) {
                      return <div key={dayIndex} className="w-3 h-3" />;
                    }

                    const dayData = getDayData(day);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <TooltipProvider key={dayIndex}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => onDayClick?.(day)}
                              className={cn(
                                'w-3 h-3 rounded-sm transition-all hover:ring-2 hover:ring-primary hover:ring-offset-1',
                                LEVEL_COLORS[dayData.level],
                                isToday && 'ring-2 ring-primary ring-offset-1'
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <p className="font-semibold">
                                {format(day, 'MMM d, yyyy')}
                              </p>
                              <p className="text-muted-foreground">
                                {LEVEL_LABELS[dayData.level]} ({dayData.count} activities)
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between pt-4 border-t text-sm">
        <div className="text-muted-foreground">
          <span className="font-semibold text-foreground">
            {data.reduce((sum, d) => sum + d.count, 0)}
          </span>{' '}
          activities in {year}
        </div>
        <div className="text-muted-foreground">
          <span className="font-semibold text-foreground">
            {data.filter((d) => d.count > 0).length}
          </span>{' '}
          days with activity
        </div>
      </div>
    </div>
  );
};
