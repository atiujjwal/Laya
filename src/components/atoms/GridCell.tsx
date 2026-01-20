import React, { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface GridCellProps extends React.HTMLAttributes<HTMLDivElement> {
  isSelected?: boolean;
  children: React.ReactNode;
}

export const GridCell = React.forwardRef<HTMLDivElement, GridCellProps>(
  ({ className, isSelected, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        tabIndex={0} // Make focusable
        className={cn(
          "min-w-[50px] h-[50px] border-r border-b flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary z-0",
          isSelected && "bg-accent",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
GridCell.displayName = "GridCell";
