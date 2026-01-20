"use client";

import React from "react";
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
} from "recharts";

// Mock Data Interfaces - Replace with real API data types
interface AnalyticsProps {
  trendData: Array<{ date: string; completionRate: number }>;
  distributionData: Array<{ name: string; value: number; color: string }>;
}

export const AnalyticsSection: React.FC<AnalyticsProps> = ({
  trendData,
  distributionData,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* 1. Completion Trend Chart */}
      <div className="border rounded-xl p-6 bg-card shadow-sm">
        <h3 className="font-semibold mb-6">Monthly Completion Trend</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="completionRate"
                stroke="#4F46E5"
                strokeWidth={3}
                dot={{ r: 4, fill: "#4F46E5", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Category Distribution Chart */}
      <div className="border rounded-xl p-6 bg-card shadow-sm">
        <h3 className="font-semibold mb-6">Habit Distribution</h3>
        <div className="h-[250px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none" }} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
