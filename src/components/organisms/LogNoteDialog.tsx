'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface LogNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  habitTitle?: string;
  habitId?: string; // We need ID to save
  initialNote?: string;
}

export function LogNoteDialog({
  open,
  onOpenChange,
  date,
  habitTitle,
  habitId,
  initialNote = '',
}: LogNoteDialogProps) {
  const [note, setNote] = useState(initialNote);
  const queryClient = useQueryClient();

  // Reset note when dialog opens with new data
  useEffect(() => {
    setNote(initialNote);
  }, [initialNote, open]);

  const saveNote = useMutation({
    mutationFn: async () => {
      if (!habitId || !date) return;
      const res = await fetch(`/api/habits/${habitId}/note`, {
        method: 'POST',
        body: JSON.stringify({
          date: date.toISOString().split('T')[0],
          note: note,
        }),
      });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast({ title: 'Note saved' });
      onOpenChange(false);
    },
  });

  if (!date) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            {habitTitle} • {format(date, 'MMMM do, yyyy')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">Reflection</Label>
            <Textarea
              id="note"
              placeholder="Why did you miss this? Or what went well?"
              className="min-h-[100px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => saveNote.mutate()}
            className="bg-primary text-white"
            disabled={saveNote.isPending}
          >
            {saveNote.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
