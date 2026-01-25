'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area'; // Assumes shadcn ScrollArea

export function NotificationPopover() {
  // Mock notifications - in production, fetch from /api/notifications
  const notifications = [
    {
      id: 1,
      title: 'Keep it up!',
      desc: "You're on a 5-day streak with 'Meditation'.",
      time: '2h ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Goal Reminder',
      desc: "You have 3 days left to complete 'Read Books'.",
      time: '5h ago',
      unread: false,
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5" />
          {/* Notification Dot */}
          <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-600 border-2 border-background" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-semibold leading-none">Notifications</h4>
          <p className="text-xs text-muted-foreground mt-1">
            You have 1 unread message.
          </p>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="flex flex-col">
            {notifications.map((n) => (
              <button
                key={n.id}
                className={`flex flex-col items-start gap-1 p-4 text-left hover:bg-muted/50 transition-colors border-b last:border-0 ${
                  n.unread ? 'bg-muted/20' : ''
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-sm">{n.title}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {n.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {n.desc}
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
