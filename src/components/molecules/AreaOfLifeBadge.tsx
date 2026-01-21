import { cn } from '@/lib/utils';
import { Wallet, Briefcase, TrendingUp, Heart, Users } from 'lucide-react';

export type AreaType =
  | 'Finances'
  | 'Career'
  | 'Personal Growth'
  | 'Health'
  | 'Relationships';

const AREA_CONFIG: Record<AreaType, { icon: any; color: string }> = {
  Finances: { icon: Wallet, color: 'text-emerald-600 bg-emerald-100' },
  Career: { icon: Briefcase, color: 'text-blue-600 bg-blue-100' },
  'Personal Growth': {
    icon: TrendingUp,
    color: 'text-purple-600 bg-purple-100',
  },
  Health: { icon: Heart, color: 'text-rose-600 bg-rose-100' },
  Relationships: { icon: Users, color: 'text-amber-600 bg-amber-100' },
};

export function AreaOfLifeBadge({ area }: { area: AreaType }) {
  const config = AREA_CONFIG[area] || AREA_CONFIG['Personal Growth'];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-md',
        config.color,
      )}
    >
      <Icon className="h-3 w-3" />
      <span className="text-[10px] font-bold uppercase">{area}</span>
    </div>
  );
}
