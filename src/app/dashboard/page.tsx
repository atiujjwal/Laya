'use client';

import { useHabits, useStats } from '@/hooks/useHabits';
import { HabitGrid } from '@/components/organisms/HabitGrid';
import { AddHabitDialog } from '@/components/organisms/AddHabitDialog';
import { DashboardCharts } from '@/components/organisms/DashboardCharts'; // Assuming this exists from previous steps
import { StatCard } from '@/components/molecules/StatCard';
import { Activity, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { habits, isLoading: habitsLoading } = useHabits();
  const { data: stats, isLoading: statsLoading } = useStats();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your daily progress and keep the streak alive.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex gap-2">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </Button>
          <AddHabitDialog />
        </div>
      </div>

      {/* 2. Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))
        ) : (
          <>
            <StatCard
              title="Total Habits"
              value={habits.length}
              icon={Activity}
              subText="Active this month"
            />
            <StatCard
              title="Completion Rate"
              value={`${stats?.completionRate}%`}
              icon={TrendingUp}
              trend="up"
              subText="+12% vs last month"
            />
            <StatCard
              title="Perfect Days"
              value={stats?.perfectDays}
              icon={CheckCircle2}
              subText="Days with 100% completion"
            />
            <StatCard
              title="Current Streak"
              value={`${stats?.currentStreak} Days`}
              icon={Activity}
              trend="up"
              subText="Best: 14 Days"
            />
          </>
        )}
      </div>

      {/* 3. Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Interactive Grid (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold">
              Daily Tracker
            </h2>
          </div>

          {habitsLoading ? (
            <Skeleton className="h-[500px] w-full rounded-xl" />
          ) : (
            <HabitGrid />
          )}
        </div>

        {/* Right Column: Summaries (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          <h2 className="text-xl font-heading font-semibold">Insights</h2>
          {/* Reusing the Charts component we built earlier */}
          <DashboardCharts />
        </div>
      </div>
    </div>
  );
}
