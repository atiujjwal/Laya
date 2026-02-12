'use client';

import React, { useMemo } from 'react';
import { format, startOfYear, endOfYear, eachDayOfInterval, isSameDay } from 'date-fns';  // Added getDay if needed
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

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const ContributionGraph: React.FC<ContributionGraphProps> = ({
  data,
  year = new Date().getFullYear(),
  onDayClick,
}) => {
  /** All calendar days of the year */
  const yearDays = useMemo(() => {
    return eachDayOfInterval({
      start: startOfYear(new Date(year, 0, 1)),
      end: endOfYear(new Date(year, 11, 31)),
    });
  }, [year]);

  /** Fast lookup: 'yyyy-MM-dd' → ContributionData */
  const dataMap = useMemo(() => {
    const map = new Map<string, ContributionData>();
    data.forEach((item) => map.set(format(item.date, 'yyyy-MM-dd'), item));
    return map;
  }, [data]);

  // Group days by week
  const weeks = useMemo(() => {
    const grid: (Date | null)[][] = [];

    // How many empty slots before Jan 1?
    const firstDayOfWeek = yearDays[0].getDay(); // 0=Sun … 6=Sat

    // Flatten: [null × offset, ...yearDays]
    const cells: (Date | null)[] = [
      ...Array(firstDayOfWeek).fill(null),
      ...yearDays,
    ];

    // Slice into groups of 7
    for (let i = 0; i < cells.length; i += 7) {
      grid.push(cells.slice(i, i + 7));
    }

    // Pad the last week to always have 7 slots
    const last = grid[grid.length - 1];
    while (last.length < 7) last.push(null);

    return grid;
  }, [yearDays]);

  const getDayData = (date: Date): ContributionData => {
    const key = format(date, 'yyyy-MM-dd');
    return dataMap.get(key) ?? { date, count: 0, level: 0 };
  };

  /**
   * Month labels: placed at the column index where that month first appears.
   * We walk every week and check the first non-null day; when the month
   * changes we record the week index.
   */
  const monthLabels = useMemo(() => {
    const labels: { month: number; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstReal = week.find((d) => d !== null) as Date | undefined;
      if (!firstReal) return;
      const m = firstReal.getMonth();
      if (m !== lastMonth) {
        lastMonth = m;
        labels.push({ month: m, weekIndex });
      }
    });

    return labels;
  }, [weeks]);

  const totalActivities = data.reduce((s, d) => s + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;

  // Each cell is w-3 (12px) + gap-1 (4px) = 16px per column
  const CELL = 16;

  return (
    <div className="w-full bg-card border rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold">Overview</h2>
          <p className="text-sm text-muted-foreground">{year} Streak</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {([0, 1, 2, 3, 4] as const).map((level) => (
              <div key={level} className={cn('w-3 h-3 rounded-sm', LEVEL_COLORS[level])} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1">

          {/* ── Month labels row ── */}
          <div className="flex pl-8"> {/* pl-8 = 2rem to offset the day-label column */}
            <div className="relative h-4" style={{ width: weeks.length * CELL }}>
              {monthLabels.map(({ month, weekIndex }) => (
                <span
                  key={month}
                  className="absolute text-xs text-muted-foreground whitespace-nowrap"
                  style={{ left: weekIndex * CELL }}
                >
                  {MONTH_NAMES[month]}
                </span>
              ))}
            </div>
          </div>

          {/* ── Grid: day-labels + week columns ── */}
          <div className="flex gap-1">

            {/* Day-of-week labels (7 rows) */}
            <div className="flex flex-col gap-1 w-7 shrink-0">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="h-3 flex items-center justify-end pr-1 text-xs text-muted-foreground"
                >
                  {/* Show only Mon, Wed, Fri to keep it tidy (same as GitHub) */}
                  {label}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  if (!day) {
                    // Empty padding cell — keeps row alignment intact
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
                            <p className="font-semibold">{format(day, 'MMM d, yyyy')}</p>
                            <p className="text-muted-foreground">
                              {dayData.count} {dayData.count === 1 ? 'activity' : 'activities'}
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

      {/* Summary */}
      <div className="flex items-center justify-between pt-4 border-t text-sm">
        <div className="text-muted-foreground">
          <span className="font-semibold text-foreground">{totalActivities}</span> activities in {year}
        </div>
        <div className="text-muted-foreground">
          <span className="font-semibold text-foreground">{activeDays}</span> days with activity
        </div>
      </div>
    </div>
  );
};
