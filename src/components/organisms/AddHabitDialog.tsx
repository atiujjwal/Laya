'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AddHabitDialog() {
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to Backend/State Management
    console.log('Submitting new habit...');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg hover:shadow-xl transition-all">
          <Plus className="h-4 w-4" /> Add New Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Habit</DialogTitle>
          <DialogDescription>
            Add a new habit to your daily tracker. Small steps lead to big
            changes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Title Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Habit
            </Label>
            <Input
              id="title"
              placeholder="e.g., Read 10 pages"
              className="col-span-3"
              required
            />
          </div>

          {/* Category Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Area
            </Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="health">Health & Wellness</SelectItem>
                <SelectItem value="work">Career & Finances</SelectItem>
                <SelectItem value="growth">Personal Growth</SelectItem>
                <SelectItem value="relationships">Relationships</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Frequency/Goal */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goal" className="text-right">
              Goal
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="goal"
                type="number"
                defaultValue={30}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">
                times per month
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-primary text-white">
              Save Habit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
