import { cn } from '@/lib/utils';

export type GoalStatus = 'Not Started' | 'In Progress' | 'Achieved';

const STATUS_STYLES: Record<GoalStatus, string> = {
  'Not Started': 'bg-neutral-100 text-neutral-600 border-neutral-200',
  'In Progress': 'bg-blue-50 text-blue-600 border-blue-200',
  Achieved: 'bg-green-50 text-green-600 border-green-200',
};

export function StatusBadge({ status }: { status: GoalStatus }) {
  return (
    <span
      className={cn(
        'px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide border',
        STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}
