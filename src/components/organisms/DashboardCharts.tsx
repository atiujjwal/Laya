'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Dummy Data
const data = [
  { name: 'Mon', completion: 40 },
  { name: 'Tue', completion: 70 },
  { name: 'Wed', completion: 55 },
  { name: 'Thu', completion: 85 },
  { name: 'Fri', completion: 60 },
  { name: 'Sat', completion: 90 },
  { name: 'Sun', completion: 75 },
];

export function DashboardCharts() {
  return (
    <div className="space-y-6">
      {/* Chart Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Weekly Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#888' }}
                  dy={10}
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
                  dataKey="completion"
                  stroke="#FF6B00"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRate)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Habits Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Top Performing Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Wake up at 6:00 AM', rate: 92, color: 'bg-emerald-500' },
              { name: 'Drink 2L Water', rate: 85, color: 'bg-blue-500' },
              { name: 'Read 10 Pages', rate: 70, color: 'bg-purple-500' },
            ].map((habit, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${habit.color}`} />
                  <span className="text-sm font-medium text-foreground">
                    {habit.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${habit.color}`}
                      style={{ width: `${habit.rate}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">
                    {habit.rate}%
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
