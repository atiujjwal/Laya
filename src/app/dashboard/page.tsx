"use client";

import { useLayaStore } from "@/lib/store";
import { useHabits, useToggleHabit } from "@/lib/hooks/use-api";
import { VirtualHabitGrid } from "@/components/organisms/VirtualHabitGrid";
import { AnalyticsSection } from "@/components/organisms/AnalyticsSection";
import { Skeleton } from "@/components/atoms/Skeleton";

export default function DashboardPage() {
  const { currentDate } = useLayaStore();
  const { data: habits, isLoading } = useHabits(currentDate);

  // Mock analytics data - in real app, derive from 'habits' data
  const analyticsData = {
    trend: [
      { date: "Mon", completionRate: 60 },
      { date: "Tue", completionRate: 85 },
    ],
    dist: [
      { name: "Health", value: 40, color: "#10B981" },
      { name: "Work", value: 60, color: "#3B82F6" },
    ],
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Analytics at top for quick insight */}
      <AnalyticsSection
        trendData={analyticsData.trend}
        distributionData={analyticsData.dist}
      />

      {/* 2. The Main Excel Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight">Habit Tracker</h2>
          {/* Add Habit Button would go here */}
        </div>

        {/* The Grid Component we built in Phase 7 */}
        <VirtualHabitGrid
          habits={habits?.data || []}
          currentDate={currentDate}
        />
      </div>
    </div>
  );
}
