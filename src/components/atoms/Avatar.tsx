import React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  fallback: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  fallback,
  size = "md",
  className,
}) => {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
  };

  return (
    <div
      className={cn(
        "relative inline-block rounded-full overflow-hidden bg-muted",
        sizeClasses[size],
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt="User Avatar"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center font-medium text-muted-foreground uppercase">
          {fallback.slice(0, 2)}
        </div>
      )}
    </div>
  );
};
