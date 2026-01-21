import Link from 'next/link';
import { Button } from '@/components/atoms/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-center p-4">
      <div className="bg-muted/30 p-6 rounded-full mb-6">
        <FileQuestion className="w-16 h-16 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Sorry, we couldn't find the page you're looking for. It might have been
        moved or deleted.
      </p>
      <Link href="/dashboard">
        <Button size="lg">Return to Dashboard</Button>
      </Link>
    </div>
  );
}
