import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div
        ref={ref}
        className={cn(
          "h-2 w-full overflow-hidden rounded-full bg-secondary",
          className,
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-primary transition-all duration-500 ease-in-out"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  },
);
ProgressBar.displayName = "ProgressBar";
