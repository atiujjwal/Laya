'use client';

import { useState } from 'react';
import { format } from 'date-fns';
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

interface LogNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  habitTitle?: string;
}

export function LogNoteDialog({
  open,
  onOpenChange,
  date,
  habitTitle,
}: LogNoteDialogProps) {
  const [note, setNote] = useState('');

  const handleSave = () => {
    console.log(`Saving note for ${date}: ${note}`);
    onOpenChange(false);
  };

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
          <Button onClick={handleSave} className="bg-primary text-white">
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
