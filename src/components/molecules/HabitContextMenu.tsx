'use client';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Check, X, FileText, Trash } from 'lucide-react';

interface HabitContextMenuProps {
  children: React.ReactNode;
  onMarkComplete: () => void;
  onMarkFailed: () => void;
  onAddNote: () => void;
}

export function HabitContextMenu({
  children,
  onMarkComplete,
  onMarkFailed,
  onAddNote,
}: HabitContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onMarkComplete}>
          <Check className="mr-2 h-4 w-4 text-green-500" />
          <span>Mark Completed</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={onMarkFailed}>
          <X className="mr-2 h-4 w-4 text-red-500" />
          <span>Mark Failed</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onAddNote}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Add Note</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-red-600">
          <Trash className="mr-2 h-4 w-4" />
          <span>Clear Data</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
