import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "ghost" | "destructive";
  size?: "sm" | "md" | "lg"; // Added size prop definition
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      isLoading,
      variant = "ghost",
      size = "md",
      children,
      ...props
    },
    ref,
  ) => {
    // Define size classes mapping
    const sizeClasses = {
      sm: "h-8 w-8 p-1",
      md: "h-10 w-10 p-2",
      lg: "h-12 w-12 p-3",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "rounded-full transition-colors flex items-center justify-center",
          // Variant Styles
          variant === "ghost" &&
            "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
          variant === "destructive" &&
            "hover:bg-destructive/10 text-destructive",
          // Size Styles
          sizeClasses[size],
          className,
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
      </button>
    );
  },
);
IconButton.displayName = "IconButton";
