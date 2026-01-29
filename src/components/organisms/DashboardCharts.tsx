'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHabits } from '@/hooks/useData';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardCharts() {
  const { data, isLoading } = useHabits();
  const habits = data?.data ?? [];

  // Transform Data for Charts (Logic to count completions per day)
  const chartData = useMemo(() => {
    if (!habits) return [];
    // Dummy logic for visualization - in real app, aggregate logs by date
    return [
      { name: 'Mon', completed: 4 },
      { name: 'Tue', completed: 6 },
      { name: 'Wed', completed: 3 },
      { name: 'Thu', completed: 8 },
      { name: 'Fri', completed: 5 },
      { name: 'Sat', completed: 9 },
      { name: 'Sun', completed: 7 },
    ];
  }, [habits]);

  const topHabits = useMemo(() => {
    if (!habits) return [];
    // Sort by consistency/streak
    return [...habits].sort((a, b) => b.streak - a.streak).slice(0, 3);
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
                  <linearGradient
                    id="colorActivity"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
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

      {/* 2. Top Habits Leaderboard */}
      <Card className="shadow-sm border-neutral-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium font-heading">
            Top Consistency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topHabits.map((habit, i) => (
              <div key={habit.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0
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
                    {/* Calculate percentage relative to 30 days */}
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${Math.min((habit.streak / 30) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">
                    {habit.streak}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
