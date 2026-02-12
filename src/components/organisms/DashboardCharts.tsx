'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Habit } from '@/types/habit';
import { subDays, format, isSameDay, differenceInCalendarDays, parseISO } from 'date-fns';
import { cn, getMaxContinuousStreakLast30Days } from '@/lib/utils';

interface DashboardChartsProps {
  habits: Habit[]
  isLoading: boolean
  className?: string
}

export function DashboardCharts({
  habits,
  isLoading,
  className,
}: DashboardChartsProps) {
  // Weekly Activity Chart (last 7 days)
  const chartData = useMemo(() => {
    if (!habits || habits.length === 0) return []

    const today = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) =>
      subDays(today, 6 - i)
    )

    return last7Days.map(date => {
      const dailyCount = habits.reduce((acc, habit) => {
        const hasLog = habit.logs?.some((log: any) => {
          const logDate = new Date(log.date)
          return (
            isSameDay(logDate, date) &&
            (log.completed === true || log.status === 'COMPLETED')
          )
        })

        return acc + (hasLog ? 1 : 0)
      }, 0)

      return {
        name: format(date, 'EEE'),
        fullDate: format(date, 'MMM d'),
        completed: dailyCount,
      }
    })
  }, [habits])

  // Top Habits by max continuous streak (last 30 days)
  const topHabits = useMemo(() => {
    if (!habits || habits.length === 0) return [];

    return habits
      .map((habit) => ({
        ...habit,
        // Pass the raw logs array to the calculator
        streak: getMaxContinuousStreakLast30Days(habit.logs || []),
      }))
      // Optional: Hide habits with 0 streak
      .filter((h) => h.streak > 0)
      // Sort Highest Streak first
      .sort((a, b) => b.streak - a.streak)
      // Take top 5
      .slice(0, 5);
  }, [habits]);

  console.log("262: ", topHabits);


  if (isLoading) return <Skeleton className="h-full w-full" />

  return (
    <div className={cn('flex flex-col gap-6 h-full', className)}>
      {/* Weekly Activity */}
      <Card className="shadow-sm border-neutral-200 flex-shrink-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium font-heading">
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[150px] w-full min-h-[150px]">
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  tick={{ fill: '#666' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  cursor={{
                    stroke: '#FF6B00',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#FF6B00"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorActivity)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Consistency */}
      <Card className="shadow-sm border-neutral-200 flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-2 flex-shrink-0">
          <CardTitle className="text-base font-medium font-heading">
            Top Consistency
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-4">
            {topHabits.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">No active habits yet.</div>
            ) : (
              topHabits.map((habit, i) => (
                <div key={habit.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-neutral-100 text-neutral-600'
                        }`}
                    >
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                      {habit.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${Math.min((habit.streak / 30) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground w-6 text-right">
                      {habit.streak}d
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}