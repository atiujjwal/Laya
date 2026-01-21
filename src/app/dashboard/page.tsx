// 'use client';

// import React, { useMemo } from 'react';
// import { useSession } from 'next-auth/react';
// import { useLayaStore } from '@/lib/store';
// import { useHabits } from '@/lib/hooks/use-api';
// import { format } from 'date-fns';

// // Components
// import { VirtualHabitGrid } from '@/components/organisms/VirtualHabitGrid';
// import { AnalyticsSection } from '@/components/organisms/AnalyticsSection';
// import { Skeleton } from '@/components/atoms/Skeleton';
// import { HabitDialog } from '@/components/organisms/HabitDialog';
// import { StatCard } from '@/components/molecules/StatCard';
// import { ThemeToggle } from '@/components/molecules/ThemeToggle';
// import { NotificationPopover } from '@/components/molecules/NotificationPopover';
// import { Avatar } from '@/components/atoms/Avatar';

// // Icons
// import {
//   Activity,
//   CheckCircle2,
//   Flame,
//   Trophy,
//   CalendarDays,
// } from 'lucide-react';
// import { Button } from '@/components/atoms/button';

// export default function DashboardPage() {
//   const { data: session } = useSession();
//   const { currentDate } = useLayaStore();
//   const { data: habitsData, isLoading } = useHabits(currentDate);

//   // --- Derived Metrics (Real-time) ---
//   const metrics = useMemo(() => {
//     if (!habitsData?.data) return null;
//     const habits = habitsData.data;

//     const totalHabits = habits.length;
//     const activeHabits = habits.filter((h: any) => !h.archived).length;
//     const avgStreak =
//       habits.reduce((acc: number, h: any) => acc + (h.currentStreak || 0), 0) /
//       (totalHabits || 1);

//     // Calculate simple completion rate for 'today' (Mock logic for illustration)
//     // In production, you'd iterate the logs for the current month
//     const completionRate = 68; // Placeholder for calculated %

//     return {
//       totalHabits,
//       activeHabits,
//       avgStreak: Math.round(avgStreak),
//       completionRate,
//     };
//   }, [habitsData]);

//   // Mock analytics data - normally derived from logs
//   const analyticsData = {
//     trend: [
//       { date: 'Mon', completionRate: 60 },
//       { date: 'Tue', completionRate: 85 },
//       { date: 'Wed', completionRate: 45 },
//       { date: 'Thu', completionRate: 72 },
//     ],
//     dist: [
//       { name: 'Health', value: 40, color: '#10B981' },
//       { name: 'Work', value: 60, color: '#3B82F6' },
//     ],
//   };

//   if (isLoading) {
//     return (
//       <div className="p-6 space-y-8 animate-pulse">
//         <div className="flex justify-between">
//           <Skeleton className="h-12 w-64 rounded-lg" />
//           <div className="flex gap-2">
//             <Skeleton className="h-10 w-10 rounded-full" />
//             <Skeleton className="h-10 w-10 rounded-full" />
//           </div>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           {[1, 2, 3, 4].map((i) => (
//             <Skeleton key={i} className="h-32 w-full rounded-xl" />
//           ))}
//         </div>
//         <Skeleton className="h-[500px] w-full rounded-xl" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8 max-w-[1600px] mx-auto">
//       {/* 1. Dashboard Header Section */}
//       <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
//         <div className="flex items-center gap-4">
//           <Avatar
//             src={session?.user?.image}
//             fallback={session?.user?.name || 'U'}
//             size="lg"
//             className="border-2 border-primary/20 hidden md:block"
//           />
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-foreground">
//               Good Morning, {session?.user?.name?.split(' ')[0] || 'Laya User'}
//             </h1>
//             <div className="flex items-center text-muted-foreground mt-1 gap-2 text-sm">
//               <CalendarDays className="w-4 h-4" />
//               <span>{format(currentDate, 'EEEE, MMMM do, yyyy')}</span>
//               <span className="text-border mx-2">|</span>
//               <span>Time to forge some habits.</span>
//             </div>
//           </div>
//         </div>

//         {/* Action Toolbar */}
//         <div className="flex items-center gap-3 w-full md:w-auto">
//           <div className="flex gap-2 mr-2 border-r pr-4">
//             <ThemeToggle />
//             <NotificationPopover />
//           </div>
//           <HabitDialog
//             trigger={
//               <Button className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
//                 + New Habit
//               </Button>
//             }
//           />
//         </div>
//       </header>

//       {/* 2. Key Metrics Row */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard
//           title="Active Habits"
//           value={metrics?.activeHabits || 0}
//           icon={Activity}
//           className="border-l-4 border-l-blue-500"
//         />
//         <StatCard
//           title="Completion Rate"
//           value={`${metrics?.completionRate}%`}
//           icon={CheckCircle2}
//           trend={{ value: 5, isPositive: true }}
//           className="border-l-4 border-l-green-500"
//         />
//         <StatCard
//           title="Avg. Streak"
//           value={`${metrics?.avgStreak} Days`}
//           icon={Flame}
//           className="border-l-4 border-l-orange-500"
//         />
//         <StatCard
//           title="Goals Hit"
//           value="3"
//           icon={Trophy}
//           trend={{ value: 1, isPositive: true }}
//           className="border-l-4 border-l-purple-500"
//         />
//       </div>

//       {/* 3. Main Content: Grid & Analytics */}
//       <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
//         {/* The Excel Grid (Takes up 3/4 width on large screens) */}
//         <div className="xl:col-span-3 space-y-4">
//           <div className="flex justify-between items-center mb-2">
//             <h2 className="text-xl font-bold flex items-center gap-2">
//               Tracker View
//               <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
//                 {format(currentDate, 'MMMM')}
//               </span>
//             </h2>
//             {/* Optional: Filter buttons or View toggles could go here */}
//           </div>
//           <VirtualHabitGrid
//             habits={habitsData?.data || []}
//             currentDate={currentDate}
//           />
//         </div>

//         {/* Analytics Sidebar (Takes up 1/4 width) */}
//         <div className="xl:col-span-1 space-y-6">
//           <h2 className="text-xl font-bold">Insights</h2>
//           <div className="bg-card border rounded-xl p-4 shadow-sm">
//             <h3 className="text-sm font-medium text-muted-foreground mb-4">
//               Weekly Trend
//             </h3>
//             <AnalyticsSection
//               trendData={analyticsData.trend}
//               distributionData={analyticsData.dist}
//             />
//           </div>

//           {/* Mini Motivation Card */}
//           <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
//             <h3 className="font-bold text-lg mb-2">Keep pushing! 🚀</h3>
//             <p className="text-indigo-100 text-sm mb-4">
//               You are 12% more consistent this month compared to last month.
//             </p>
//             <Button
//               variant="secondary"
//               size="sm"
//               className="w-full text-indigo-700"
//             >
//               View Full Report
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useLayaStore } from '@/lib/store';
import { useHabits } from '@/lib/hooks/use-api';
import { format } from 'date-fns';

// Components
import { VirtualHabitGrid } from '@/components/organisms/VirtualHabitGrid';
import { AnalyticsSection } from '@/components/organisms/AnalyticsSection';
import { Skeleton } from '@/components/atoms/Skeleton';
import { HabitDialog } from '@/components/organisms/HabitDialog';
import { StatCard } from '@/components/molecules/StatCard';
import { ThemeToggle } from '@/components/molecules/ThemeToggle';
import { NotificationPopover } from '@/components/molecules/NotificationPopover';
import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/atoms/button';

// Icons
import {
  Activity,
  CheckCircle2,
  Flame,
  Trophy,
  CalendarDays,
  Plus,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const { currentDate } = useLayaStore();
  const { data: habitsData, isLoading } = useHabits(currentDate);

  // --- Real-time Metrics Calculation ---
  const metrics = useMemo(() => {
    if (!habitsData?.data) return { total: 0, active: 0, streak: 0, rate: 0 };
    const habits = habitsData.data;

    const total = habits.length;
    const active = habits.filter((h: any) => !h.archived).length;
    const streak = Math.round(
      habits.reduce((acc: number, h: any) => acc + (h.currentStreak || 0), 0) /
        (total || 1),
    );
    // Mock completion rate logic (replace with real log calculation)
    const rate = 72;

    return { total, active, streak, rate };
  }, [habitsData]);

  // Mock Analytics Data (Replace with real derived data)
  const analyticsData = {
    trend: [
      { date: 'Mon', completionRate: 45 },
      { date: 'Tue', completionRate: 52 },
      { date: 'Wed', completionRate: 49 },
      { date: 'Thu', completionRate: 62 },
      { date: 'Fri', completionRate: 69 },
      { date: 'Sat', completionRate: 85 },
      { date: 'Sun', completionRate: 91 },
    ],
    dist: [
      { name: 'Health', value: 35, color: '#10B981' }, // Emerald-500
      { name: 'Work', value: 45, color: '#3B82F6' }, // Blue-500
      { name: 'Learning', value: 20, color: '#8B5CF6' }, // Violet-500
    ],
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-muted/5 pb-20">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
        {/* --- SECTION 1: HEADER & ACTIONS --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar
              src={session?.user?.image}
              fallback={session?.user?.name || 'U'}
              size="lg"
              className="border-4 border-muted hidden md:block"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {session?.user?.name
                  ? `Hi, ${session?.user?.name.split(' ')[0]}`
                  : 'Welcome Back'}
              </h1>
              <div className="flex items-center text-muted-foreground mt-1 gap-2 text-sm font-medium">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span>{format(currentDate, 'EEEE, MMMM do, yyyy')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-full border">
              <ThemeToggle />
              <NotificationPopover />
            </div>
            <HabitDialog
              trigger={
                <Button className="h-10 px-6 rounded-full shadow-md hover:shadow-lg transition-all">
                  <Plus className="w-4 h-4 mr-2" /> New Habit
                </Button>
              }
            />
          </div>
        </header>

        {/* --- SECTION 2: METRICS ROW --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Habits"
            value={metrics.active}
            icon={Activity}
            className="bg-background border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow"
          />
          <StatCard
            title="Completion Rate"
            value={`${metrics.rate}%`}
            icon={CheckCircle2}
            trend={{ value: 4.5, isPositive: true }}
            className="bg-background border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow"
          />
          <StatCard
            title="Avg. Streak"
            value={`${metrics.streak} Days`}
            icon={Flame}
            className="bg-background border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow"
          />
          <StatCard
            title="Perfect Days"
            value="4"
            icon={Trophy}
            trend={{ value: 2, isPositive: true }}
            className="bg-background border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow"
          />
        </div>

        {/* --- SECTION 3: MAIN WORKSPACE (GRID + ANALYTICS) --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT COLUMN: The Excel Grid (2/3 width) */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            <div className="bg-background border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b flex justify-between items-center bg-muted/5">
                <h2 className="font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Tracker View
                </h2>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                  {format(currentDate, 'MMMM yyyy')}
                </span>
              </div>

              {/* The Virtual Grid fills the remaining height */}
              <div className="flex-1 min-h-0">
                <VirtualHabitGrid
                  habits={habitsData?.data || []}
                  currentDate={currentDate}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Analytics & Insights (1/3 width) */}
          <div className="flex flex-col gap-6">
            {/* Chart Container */}
            <div className="bg-background border rounded-2xl shadow-sm p-5 h-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Performance
                </h2>
              </div>

              {/* Using the Analytics Section Component */}
              <AnalyticsSection
                trendData={analyticsData.trend}
                distributionData={analyticsData.dist}
              />
            </div>

            {/* AI Insight / Motivation Card */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-yellow-300 fill-current" />
                  Keep pushing!
                </h3>
                <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
                  You are <strong>12% more consistent</strong> this month
                  compared to last month. Try to hit your "Health" goals this
                  weekend to maintain your streak.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-indigo-700 font-semibold"
                >
                  View Full Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Skeleton Component
function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <Skeleton className="h-16 w-1/3 rounded-2xl" />
        <Skeleton className="h-12 w-32 rounded-full" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <Skeleton className="col-span-2 h-[600px] rounded-2xl" />
        <Skeleton className="col-span-1 h-[600px] rounded-2xl" />
      </div>
    </div>
  );
}
