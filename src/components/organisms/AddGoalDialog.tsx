'use client';

import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from '@/components/ui/use-toast';

export function AddGoalDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // State
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('');
  const [reward, setReward] = useState('');
  const [date, setDate] = useState<Date>();
  const [steps, setSteps] = useState<string[]>(['']);

  // Helpers
  const handleAddStep = () => setSteps([...steps, '']);
  const handleRemoveStep = (index: number) =>
    setSteps(steps.filter((_, i) => i !== index));
  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const createGoal = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/goals', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Goal set successfully!' });
      setOpen(false);
      // Reset form
      setTitle('');
      setArea('');
      setReward('');
      setDate(undefined);
      setSteps(['']);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !area || !date) {
      toast({ title: 'Missing required fields', variant: 'destructive' });
      return;
    }

    const payload = {
      title,
      area,
      reward,
      deadline: date.toISOString(),
      steps: steps
        .filter((s) => s.trim() !== '')
        .map((s) => ({ text: s, isCompleted: false })),
    };

    createGoal.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
          <Plus className="h-4 w-4" /> New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set a New Goal</DialogTitle>
          <DialogDescription>
            Define your aspiration and actionable steps.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Goal Title</Label>
              <Input
                placeholder="e.g., Run a Marathon"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Area of Life</Label>
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Health">Health & Wellness</SelectItem>
                  <SelectItem value="Finances">Finances</SelectItem>
                  <SelectItem value="Career">Career</SelectItem>
                  <SelectItem value="Personal Growth">
                    Personal Growth
                  </SelectItem>
                  <SelectItem value="Relationships">Relationships</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reward</Label>
              <Input
                placeholder="e.g., New Shoes"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label className="mb-2">Target Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label>Actionable Steps</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddStep}
                className="text-primary hover:text-primary/80"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Step
              </Button>
            </div>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <span className="flex-none pt-2.5 text-xs text-muted-foreground font-medium w-4">
                    {index + 1}.
                  </span>
                  <Input
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    className="flex-1"
                  />
                  {steps.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveStep(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-primary"
              disabled={createGoal.isPending}
            >
              {createGoal.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
