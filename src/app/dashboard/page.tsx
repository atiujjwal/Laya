import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardCharts } from "@/components/organisms/DashboardCharts";
import { HabitGrid } from "@/components/organisms/HabitGrid";
import { Activity, CheckCircle2, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Habit Tracker Dashboard
          </h1>
          <p className="text-muted-foreground">Thursday, January 22, 2026</p>
        </div>
        <div className="flex gap-2">
          {/* Month/Year Dropdowns will go here */}
          <Button variant="outline">January</Button>
          <Button variant="outline">2026</Button>
          <Button className="bg-primary hover:bg-primary/90">Add Habit</Button>
        </div>
      </div>

      {/* 2. Top Metrics (Summary) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Habits"
          value="12"
          icon={Activity}
          sub="Active this month"
        />
        <MetricCard
          title="Completion Rate"
          value="68%"
          icon={TrendingUp}
          sub="+12% from last month"
        />
        <MetricCard
          title="Perfect Days"
          value="4"
          icon={CheckCircle2}
          sub="Current streak: 2 days"
        />
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left/Center: Habit Grid (Takes up 8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="min-h-[500px] border shadow-sm">
            <CardHeader>
              <CardTitle>Daily Habits</CardTitle>
            </CardHeader>
            <CardContent>
              {/* <HabitGrid /> component will go here later */}
              <div className="flex items-center justify-center h-64 bg-slate-50 border-2 border-dashed rounded-lg text-muted-foreground">
                Habit Grid Component Loading...
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Summaries & Top Habits (Takes up 4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Progress Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Progress</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center bg-slate-50">
              [Line Chart Placeholder]
            </CardContent>
          </Card>

          {/* Top Habits List */}
          <Card>
            <CardHeader>
              <CardTitle>Top Habits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm font-medium">Wake up early</span>
                    </div>
                    <span className="text-sm text-muted-foreground">92%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Simple Helper Component for Metrics
function MetricCard({ title, value, icon: Icon, sub }: any) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <p className="text-xs text-muted-foreground mt-1">{sub}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
