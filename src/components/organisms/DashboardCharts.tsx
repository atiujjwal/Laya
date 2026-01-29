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
import { Habit } from '@/types/habit'; // Ensure you have this type imported
import { startOfDay, subDays, format, isSameDay } from 'date-fns';

interface DashboardChartsProps {
  habits: Habit[];
  isLoading: boolean;
}

export function DashboardCharts({ habits, isLoading }: DashboardChartsProps) {

  // --- REAL DATA AGGREGATION ---
  const chartData = useMemo(() => {
    if (!habits || habits.length === 0) return [];

    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i); // 6 days ago to today
      return d;
    });

    return last7Days.map((date) => {
      // Count total completions for this specific date across ALL habits
      const dailyCount = habits.reduce((acc, habit) => {
        const hasLog = habit.logs?.some((log: any) => {
          const logDate = new Date(log.date);
          return (
            isSameDay(logDate, date) &&
            (log.completed === true || log.status === 'COMPLETED')
          );
        });
        return acc + (hasLog ? 1 : 0);
      }, 0);

      return {
        name: format(date, 'EEE'), // Mon, Tue...
        fullDate: format(date, 'MMM d'),
        completed: dailyCount,
      };
    });
  }, [habits]);

  const topHabits = useMemo(() => {
    if (!habits) return [];
    // Sort by current streak (descending)
    return [...habits]
      .sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0))
      .slice(0, 3);
  }, [habits]);

  if (isLoading) return <Skeleton className="h-[400px] w-full" />;

  return (
    <div className="space-y-6">
      {/* 1. Activity Chart */}
      <Card className="shadow-sm border-neutral-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium font-heading">
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height={200}>
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
                  formatter={(value: number) => [value, 'Completed']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      return payload[0].payload.fullDate;
                    }
                    return label;
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

      {/* 2. Top Habits Leaderboard */}
      <Card className="shadow-sm border-neutral-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium font-heading">
            Top Consistency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topHabits.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">No active habits yet.</div>
            ) : (
              topHabits.map((habit, i) => (
                <div key={habit.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0
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
                          width: `${Math.min(((habit.currentStreak || 0) / 30) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">
                      {habit.currentStreak}d
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}