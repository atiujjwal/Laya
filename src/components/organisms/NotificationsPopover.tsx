'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Streak maintained! 🔥',
    message: "You've hit your 5-day streak for 'Meditation'. Keep it up!",
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    title: 'Goal Reminder',
    message: "Don't forget to 'Read 10 Pages' today to stay on track.",
    time: '5 hours ago',
    read: false,
  },
  {
    id: 3,
    title: 'New Badge Unlocked',
    message: "You earned the 'Early Bird' badge.",
    time: '1 day ago',
    read: true,
  },
];

export function NotificationsPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive animate-pulse" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-neutral-50/50">
          <h4 className="font-semibold text-sm">Notifications</h4>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-auto py-1 text-primary"
          >
            Mark all read
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="divide-y">
            {NOTIFICATIONS.map((item) => (
              <div
                key={item.id}
                className={`p-4 hover:bg-neutral-50 transition-colors cursor-pointer ${!item.read ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <h5 className="text-sm font-medium leading-none">
                    {item.title}
                  </h5>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-2 border-t text-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground h-8"
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
