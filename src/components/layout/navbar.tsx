'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sun, User } from 'lucide-react';

// Import the new organism components
import { MobileNav } from './MobileNav';
import { NotificationsPopover } from '@/components/organisms/NotificationsPopover';

// Navigation Items Configuration
const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Habits', href: '/dashboard/habits' },
  { name: 'Goals', href: '/dashboard/goals' },
  { name: 'Profile', href: '/dashboard/profile' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 h-16 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* 1. Logo Section */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
            <Sun className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground font-heading tracking-tight">
            Laya
          </span>
        </Link>

        {/* 2. Desktop Navigation (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary relative py-1',
                pathname === item.href
                  ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary'
                  : 'text-muted-foreground',
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* 3. Right Actions Area */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Toggle (Placeholder for now) */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle Theme"
            className="hidden sm:inline-flex"
          >
            <Sun className="h-5 w-5" />
          </Button>

          {/* Notifications Popover */}
          <NotificationsPopover />

          {/* User Profile Menu (Placeholder) */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="User Profile"
            className="hidden sm:inline-flex"
          >
            <User className="h-5 w-5" />
          </Button>

          {/* Mobile Menu Trigger (Visible only on Mobile) */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
