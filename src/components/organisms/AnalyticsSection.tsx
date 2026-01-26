'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AnalyticsProps {
  trendData: Array<{ date: string; completionRate: number }>;
  distributionData: Array<{ name: string; value: number; color: string }>;
}

export const AnalyticsSection: React.FC<AnalyticsProps> = ({
  trendData,
  distributionData,
}) => {
  return (
    <div className="space-y-8">
      {/* Chart 1: Trend Line */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Weekly Trend
        </h3>
        {/* EXPLICIT HEIGHT CONTAINER */}
        <div className="h-[200px] w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
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
              <YAxis hide domain={[0, 100]} />
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
                dataKey="completionRate"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ r: 3, fill: 'hsl(var(--primary))' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Distribution Pie */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Category Split
        </h3>
        {/* EXPLICIT HEIGHT CONTAINER */}
        <div className="h-[200px] w-full min-h-[200px] relative">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="middle"
                layout="vertical"
                align="right"
                iconType="circle"
                wrapperStyle={{
                  fontSize: '11px',
                  color: 'hsl(var(--muted-foreground))',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pr-[25%]">
            <span className="text-2xl font-bold text-foreground">
              {distributionData.reduce((a, b) => a + b.value, 0)}
            </span>
            <p className="text-[10px] text-muted-foreground uppercase">
              Habits
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
