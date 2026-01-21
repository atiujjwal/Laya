// src/components/atoms/input.tsx  (or ui/input.tsx)

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  {
    variants: {
      variant: {
        default: "border-input",
        error:
          "border-destructive focus-visible:ring-destructive/50 text-destructive",
        success:
          "border-green-500 focus-visible:ring-green-500/50 text-green-900 dark:text-green-100",
      },
      // ────────────────────────────────────────────────
      // Changed from "size" → "inputSize" to avoid conflict
      // ────────────────────────────────────────────────
      inputSize: {
        default: "h-10 px-3 py-2",
        sm: "h-9 px-3 py-1.5 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  },
);

export interface InputProps
  extends
    React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: boolean;
  // Optional: if you really want to expose the native size attribute
  htmlSize?: number;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant,
      inputSize,
      label,
      error,
      success,
      disabled,
      htmlSize,
      ...props
    },
    ref,
  ) => {
    const inputId = React.useId();

    const hasLabel = !!label;
    const hasError = !!error;
    const isSuccess = success && !hasError;

    return (
      <div className="space-y-2">
        {hasLabel && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              hasError && "text-destructive",
              isSuccess && "text-green-600 dark:text-green-400",
            )}
          >
            {label}
          </label>
        )}

        <input
          id={inputId}
          type={type}
          className={cn(
            inputVariants({ variant, inputSize, className }),
            hasError && "border-destructive focus-visible:ring-destructive/50",
            isSuccess && "border-green-500 focus-visible:ring-green-500/50",
            disabled && "opacity-60 cursor-not-allowed",
          )}
          ref={ref}
          disabled={disabled}
          size={htmlSize} // ← native HTML size attribute (optional)
          aria-invalid={hasError ? "true" : "false"}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          {...props}
        />

        {hasError && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-destructive mt-1.5"
            role="alert"
          >
            {error}
          </p>
        )}

        {isSuccess && !hasError && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-1.5">
            Looks good!
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };
