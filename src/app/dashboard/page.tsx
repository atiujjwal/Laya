'use client';

import { useHabits, useStats } from '@/hooks/useHabits';
import { HabitGrid } from '@/components/organisms/HabitGrid';
import { AddHabitDialog } from '@/components/organisms/AddHabitDialog';
import { DashboardCharts } from '@/components/organisms/DashboardCharts';
import { StatCard } from '@/components/molecules/StatCard';
import { GridDashboard } from '@/components/templates/GridDashboard';
import { useAnalytics, useXPStats } from '@/hooks/useAnalytics';
import { useTimelineTasks, useMoveTimelineTask, useUpdateTimelineTask } from '@/hooks/useTimeline';
import { useLayaStore } from '@/lib/store';
import { Activity, CheckCircle2, TrendingUp, Calendar, LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardPage() {
  const { habits, isLoading: habitsLoading, toggleHabit } = useHabits();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { currentDate } = useLayaStore();
  const [viewMode, setViewMode] = useState<'grid' | 'classic'>('grid');

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalytics();
  const { data: xpStats, isLoading: xpLoading } = useXPStats();

  // Fetch timeline tasks
  const { data: timelineTasks = [], isLoading: timelineLoading } = useTimelineTasks(currentDate);
  const moveTask = useMoveTimelineTask();
  const updateTask = useUpdateTimelineTask();

  // Convert habits to habit matrix format
  const habitMatrixData = Array.isArray(habits)
    ? habits.map((habit: any) => ({
        habitId: habit.id,
        habitTitle: habit.title,
        habitColor: habit.color || 'hsl(var(--primary))',
        // Normalize dates from server (stored as UTC) into local dates so
        // the matrix does not show "previous day" in certain timezones.
        completions: (habit.logs || [])
          .filter((log: any) => log.completed === true)
          .map((log: any) => {
            const d = new Date(log.date);
            return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
          }),
      }))
    : [];

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'classic' : 'grid')}
          >
            {viewMode === 'grid' ? (
              <>
                <LayoutList className="h-4 w-4 mr-2" />
                Classic View
              </>
            ) : (
              <>
                <LayoutGrid className="h-4 w-4 mr-2" />
                Grid View
              </>
            )}
          </Button>
          <AddHabitDialog />
        </div>
      </div>

      {/* 2. Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading || xpLoading ? (
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
              value={`${stats?.completionRate || 0}%`}
              icon={TrendingUp}
              trend="up"
              subText="+12% vs last month"
            />
            <StatCard
              title="Current Level"
              value={`Level ${xpStats?.currentLevel || 1}`}
              icon={CheckCircle2}
              subText={`${xpStats?.totalXP || 0} XP total`}
            />
            <StatCard
              title="Current Streak"
              value={`${stats?.currentStreak || 0} Days`}
              icon={Activity}
              trend="up"
              subText={`Best: ${stats?.longestStreak || 0} Days`}
            />
          </>
        )}
      </div>

      {/* 3. Main Content - Grid or Classic View */}
      {viewMode === 'grid' ? (
        <GridDashboard
          date={currentDate}
          tasks={timelineTasks}
          contributionData={analyticsData?.contributionData || []}
          xpData={analyticsData?.xpData || []}
          categoryBreakdown={analyticsData?.categoryBreakdown || []}
          totalXP={xpStats?.totalXP || 0}
          currentLevel={xpStats?.currentLevel || 1}
          xpToNextLevel={xpStats?.xpToNextLevel || 1000}
          habitMatrixData={habitMatrixData}
          onTaskUpdate={(taskId, updates) => updateTask.mutate({ taskId, updates })}
          onTaskMove={(taskId, newStartTime, newEndTime) =>
            moveTask.mutate({ taskId, newStartTime, newEndTime })
          }
          onDayClick={(date) => {
            // Navigate to that day or update current date
            console.log('Day clicked:', date);
          }}
          onHabitCellClick={(habitId, date) => {
            // Use the existing toggleHabit mutation so Matrix + main grid stay in sync
            toggleHabit({ id: habitId, date });
          }}
        />
      ) : (
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
            <DashboardCharts />
          </div>
        </div>
      )}
    </div>
  );
}
