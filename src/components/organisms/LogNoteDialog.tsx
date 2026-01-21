'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/button';
import { Textarea } from '@/components/atoms/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface LogNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  habitId: string;
  date: Date;
  currentNote?: string;
}

export const LogNoteDialog: React.FC<LogNoteDialogProps> = ({
  isOpen,
  onClose,
  habitId,
  date,
  currentNote,
}) => {
  const [note, setNote] = useState(currentNote || '');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      // We use the log endpoint but update the 'meta' field
      const res = await fetch('/api/habits/log', {
        method: 'POST',
        body: JSON.stringify({
          habitId,
          date: date.toISOString(),
          completed: true, // Assuming adding a note implies activity, or pass existing status
          value: 1,
          meta: { note }, // The key change
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      onClose();
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note for {date.toLocaleDateString()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How did it go? (e.g. Felt tired but pushed through)"
            className="min-h-[100px]"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => mutation.mutate()}>Save Note</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
