'use client';

import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Plus, Loader2 } from 'lucide-react';
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
import { toast } from '@/components/ui/use-toast';

export function AddHabitDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    frequency: 'daily',
    goalCount: 30,
  });

  const createHabit = useMutation({
    mutationFn: async (newHabit: typeof formData) => {
      const res = await fetch('/api/habits', {
        method: 'POST',
        body: JSON.stringify(newHabit),
      });
      if (!res.ok) throw new Error('Failed to create habit');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast({ title: 'Habit created successfully!' });
      setOpen(false);
      setFormData({
        title: '',
        category: '',
        frequency: 'daily',
        goalCount: 30,
      }); // Reset
    },
    onError: () => {
      toast({ title: 'Failed to create habit', variant: 'destructive' });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      toast({
        title: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    createHabit.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Add Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
          <DialogDescription>
            Start tracking a new daily routing. Consistency is key!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Habit
            </Label>
            <Input
              id="title"
              placeholder="e.g., Read 10 pages"
              className="col-span-3"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Area
            </Label>
            <Select
              value={formData.category}
              onValueChange={(val) =>
                setFormData({ ...formData, category: val })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Health">Health & Wellness</SelectItem>
                <SelectItem value="Work">Career & Finances</SelectItem>
                <SelectItem value="Growth">Personal Growth</SelectItem>
                <SelectItem value="Relationships">Relationships</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goal" className="text-right">
              Target
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="goal"
                type="number"
                className="w-20"
                value={formData.goalCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    goalCount: parseInt(e.target.value),
                  })
                }
              />
              <span className="text-sm text-muted-foreground">
                times / month
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={createHabit.isPending}
              className="bg-primary"
            >
              {createHabit.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Habit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
