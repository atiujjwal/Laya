import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-card border rounded-xl p-6 shadow-sm flex items-start justify-between',
        className,
      )}
    >
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold mt-2">{value}</h3>

        {trend && (
          <div
            className={cn(
              'flex items-center text-xs mt-1 font-medium',
              trend.isPositive ? 'text-green-600' : 'text-red-600',
            )}
          >
            <span>
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        )}
      </div>
      <div className="p-3 bg-primary/10 rounded-lg text-primary">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
