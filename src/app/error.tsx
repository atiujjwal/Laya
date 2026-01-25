'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-center p-4">
      <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-full mb-6">
        <AlertTriangle className="w-16 h-16 text-red-600 dark:text-red-500" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight mb-2">
        Something went wrong!
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        We apologize for the inconvenience. An unexpected error occurred while
        processing your request.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          Go Home
        </Button>
        <Button onClick={() => reset()}>Try Again</Button>
      </div>
    </div>
  );
}
