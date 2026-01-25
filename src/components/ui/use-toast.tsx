'use client';

import { toast as sonnerToast } from 'sonner';

type ToastVariant = 'default' | 'destructive';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: React.ReactNode;
  duration?: number;
}

export function toast({
  title,
  description,
  variant = 'default',
  action,
  duration,
}: ToastOptions = {}) {
  const isDestructive = variant === 'destructive';

  if (isDestructive) {
    sonnerToast.error(title ?? 'Error', {
      description,
      action,
      duration,
    });
  } else {
    sonnerToast.success(title ?? 'Success', {
      description,
      action,
      duration,
    });
  }
}
