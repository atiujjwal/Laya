import { cn } from '@/lib/utils';

interface HabitInfoProps {
  title: string;
  category: string;
  className?: string;
}

export function HabitInfo({ title, category, className }: HabitInfoProps) {
  const categoryColors: Record<string, string> = {
    Health: 'text-emerald-600 bg-emerald-50',
    Work: 'text-blue-600 bg-blue-50',
    Growth: 'text-purple-600 bg-purple-50',
    default: 'text-slate-600 bg-slate-50',
  };

  const colorClass = categoryColors[category] || categoryColors.default;

  return (
    <div
      className={cn(
        'sticky left-0 z-10 w-48 min-w-[12rem] bg-white px-4 py-3 border-r shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]',
        className,
      )}
    >
      <p className="font-medium text-sm truncate text-foreground" title={title}>
        {title}
      </p>
      <span
        className={cn(
          'text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-1 inline-block',
          colorClass,
        )}
      >
        {category}
      </span>
    </div>
  );
}
