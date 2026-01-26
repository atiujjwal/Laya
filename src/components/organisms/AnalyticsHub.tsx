'use client';

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Award, Target } from 'lucide-react';

export interface XPData {
  date: string;
  xp: number;
  category: string;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  color: string;
}

interface AnalyticsHubProps {
  xpData: XPData[];
  categoryBreakdown: CategoryBreakdown[];
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
}

// Pastel color palette for charts
const PASTEL_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  '#FFB3BA', // Soft pink
  '#BAFFC9', // Soft green
  '#BAE1FF', // Soft blue
  '#FFFFBA', // Soft yellow
  '#FFDFBA', // Soft orange
];

export const AnalyticsHub: React.FC<AnalyticsHubProps> = ({
  xpData,
  categoryBreakdown,
  totalXP,
  currentLevel,
  xpToNextLevel,
}) => {
  // Aggregate XP by date
  const xpTrend = useMemo(() => {
    const grouped = new Map<string, number>();
    
    xpData.forEach((item) => {
      const existing = grouped.get(item.date) || 0;
      grouped.set(item.date, existing + item.xp);
    });

    return Array.from(grouped.entries())
      .map(([date, xp]) => ({ date, xp }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [xpData]);

  // Calculate XP progress percentage
  const xpProgress = useMemo(() => {
    if (xpToNextLevel === 0) return 100;
    const currentLevelXP = currentLevel * 1000; // Assuming 1000 XP per level
    const progress = ((totalXP - currentLevelXP) / xpToNextLevel) * 100;
    return Math.min(100, Math.max(0, progress));
  }, [totalXP, currentLevel, xpToNextLevel]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* XP Overview Card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            XP & Leveling System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-primary">{totalXP.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-primary">Level {currentLevel}</div>
              <div className="text-sm text-muted-foreground">Current Level</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-primary">{xpToNextLevel}</div>
              <div className="text-sm text-muted-foreground">XP to Next Level</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress to Level {currentLevel + 1}</span>
              <span className="font-semibold">{Math.round(xpProgress)}%</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* XP Trend Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            XP Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={xpTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--popover-foreground))',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="xp"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown Donut Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || PASTEL_COLORS[index % PASTEL_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--popover-foreground))',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: '11px',
                    color: 'hsl(var(--muted-foreground))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Text Overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-2xl font-bold text-foreground">
                {categoryBreakdown.reduce((sum, cat) => sum + cat.value, 0)}
              </span>
              <p className="text-[10px] text-muted-foreground uppercase">Total XP</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
